from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "krishimitra_disease_model_v1.pth"
)


# =========================================================
# DEVICE
# =========================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"KrishiMitra ML device: {device}")


# =========================================================
# LOAD CHECKPOINT
# =========================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"KrishiMitra model not found at: {MODEL_PATH}"
    )

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False
)

class_names = checkpoint["class_names"]

num_classes = checkpoint["num_classes"]

image_size = checkpoint.get(
    "image_size",
    224
)

normalization_mean = checkpoint.get(
    "normalization_mean",
    [0.485, 0.456, 0.406]
)

normalization_std = checkpoint.get(
    "normalization_std",
    [0.229, 0.224, 0.225]
)


# =========================================================
# CREATE MOBILENET V3
# =========================================================

model = models.mobilenet_v3_large(
    weights=None
)

input_features = model.classifier[3].in_features

model.classifier[3] = nn.Linear(
    input_features,
    num_classes
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)

model.eval()

print(
    f"KrishiMitra disease model loaded successfully. "
    f"Supported classes: {num_classes}"
)


# =========================================================
# IMAGE PREPROCESSING
# =========================================================

image_transform = transforms.Compose([
    transforms.Resize(
        (image_size, image_size)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=normalization_mean,
        std=normalization_std
    )
])


# =========================================================
# PREDICTION FUNCTION
# =========================================================

def predict_disease(image: Image.Image):

    # -----------------------------------------------------
    # PREPARE IMAGE
    # -----------------------------------------------------

    image = image.convert("RGB")

    image_tensor = image_transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    image_tensor = image_tensor.to(device)


    # -----------------------------------------------------
    # RUN MODEL
    # -----------------------------------------------------

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        # Get top two predictions
        top_probabilities, top_indices = torch.topk(
            probabilities,
            k=2,
            dim=1
        )


    # -----------------------------------------------------
    # EXTRACT RESULTS
    # -----------------------------------------------------

    confidence = (
        top_probabilities[0][0].item()
        * 100
    )

    second_confidence = (
        top_probabilities[0][1].item()
        * 100
    )

    predicted_index = (
        top_indices[0][0].item()
    )

    second_index = (
        top_indices[0][1].item()
    )

    predicted_class = (
        class_names[predicted_index]
    )

    second_class = (
        class_names[second_index]
    )


    # -----------------------------------------------------
    # CONFIDENCE GAP
    # -----------------------------------------------------

    confidence_gap = (
        confidence
        - second_confidence
    )


    # -----------------------------------------------------
    # CHECK IF HEALTHY CLASS
    # -----------------------------------------------------

    is_healthy = (
        "healthy"
        in predicted_class.lower()
    )


    # -----------------------------------------------------
    # CONFIDENCE ASSESSMENT
    # -----------------------------------------------------

    if (
        confidence >= 85
        and confidence_gap >= 20
    ):

        reliability = "high"
        needs_review = False

        if is_healthy:

            message = (
                "KrishiMitra identified this crop as healthy "
                "with high confidence."
            )

        else:

            message = (
                "KrishiMitra detected signs of this disease "
                "with high confidence."
            )


    elif confidence >= 70:

        reliability = "medium"
        needs_review = True

        if is_healthy:

            message = (
                "KrishiMitra may have identified this crop "
                "as healthy, but verification is recommended."
            )

        else:

            message = (
                "KrishiMitra has moderate confidence in this "
                "disease prediction. Verification is recommended."
            )


    else:

        reliability = "low"
        needs_review = True

        message = (
            "KrishiMitra is uncertain about this image. "
            "Please upload a clear image of a supported crop leaf."
        )


    # -----------------------------------------------------
    # RETURN RESULT
    # -----------------------------------------------------

    return {
        "classIndex": predicted_index,

        "className": predicted_class,

        "confidence": round(
            confidence,
            2
        ),

        "reliability": reliability,

        "needsReview": needs_review,

        "message": message,

        "secondPrediction": {
            "classIndex": second_index,

            "className": second_class,

            "confidence": round(
                second_confidence,
                2
            ),
        }
    }