from io import BytesIO
from typing import Optional

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware

from PIL import Image

from pydantic import BaseModel, Field

from .disease_model import predict_disease
from .soil_engine import analyse_soil


# =====================================================
# SOIL ANALYSIS REQUEST MODEL
# =====================================================

class SoilAnalysisRequest(BaseModel):

    nitrogen: float = Field(
        ge=0,
        le=100000,
    )

    phosphorus: float = Field(
        ge=0,
        le=100000,
    )

    potassium: float = Field(
        ge=0,
        le=100000,
    )

    # NPK measurement unit
    npkUnit: str = "kg/ha"

    ph: float = Field(
        ge=0,
        le=14,
    )

    # Optional because some soil reports
    # do not provide moisture.
    moisture: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
    )

    # Optional because frontend can later
    # obtain this from live weather.
    temperature: Optional[float] = Field(
        default=None,
        ge=-10,
        le=60,
    )


# =====================================================
# KRISHIMITRA AI BACKEND
# =====================================================

app = FastAPI(
    title="KrishiMitra AI API",
    description=(
        "Backend API for KrishiMitra AI - "
        "Disease Detection and Soil Intelligence"
    ),
    version="2.0.0",
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# CONFIGURATION
# =====================================================

MAX_IMAGE_SIZE = (
    8 * 1024 * 1024
)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():

    return {
        "app": "KrishiMitra AI",

        "status": "running",

        "version": "2.0.0",

        "services": {
            "diseaseDetection": True,
            "soilIntelligence": True,
        },
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",

        "service": (
            "KrishiMitra AI Backend"
        ),

        "version": "2.0.0",

        "diseaseModel": (
            "KrishiMitra Disease Model V1"
        ),

        "diseaseModelConnected": True,

        "soilEngine": (
            "KrishiMitra Soil "
            "Intelligence V2"
        ),

        "soilEngineConnected": True,
    }


# =====================================================
# CROP DISEASE DETECTION
# =====================================================

@app.post("/api/disease/detect")
async def detect_crop_disease(
    image: UploadFile = File(...)
):

    # -------------------------------------------------
    # VALIDATE FILE TYPE
    # -------------------------------------------------

    if (
        image.content_type
        not in ALLOWED_IMAGE_TYPES
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "Invalid image type. "
                "Upload JPG, PNG or WEBP."
            ),
        )


    # -------------------------------------------------
    # READ IMAGE
    # -------------------------------------------------

    image_bytes = await image.read()


    # -------------------------------------------------
    # CHECK EMPTY IMAGE
    # -------------------------------------------------

    if not image_bytes:

        raise HTTPException(
            status_code=400,

            detail=(
                "Uploaded image is empty."
            ),
        )


    # -------------------------------------------------
    # CHECK IMAGE SIZE
    # -------------------------------------------------

    if (
        len(image_bytes)
        > MAX_IMAGE_SIZE
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "Image must be smaller "
                "than 8 MB."
            ),
        )


    # -------------------------------------------------
    # VERIFY IMAGE
    # -------------------------------------------------

    try:

        verification_image = Image.open(
            BytesIO(image_bytes)
        )

        verification_image.verify()

    except Exception:

        raise HTTPException(
            status_code=400,

            detail=(
                "The uploaded file is not "
                "a valid image."
            ),
        )


    # -------------------------------------------------
    # OPEN IMAGE FOR AI MODEL
    # -------------------------------------------------

    try:

        pil_image = Image.open(
            BytesIO(image_bytes)
        )

        pil_image = (
            pil_image.convert("RGB")
        )

    except Exception:

        raise HTTPException(
            status_code=400,

            detail=(
                "Could not process "
                "the uploaded image."
            ),
        )


    # -------------------------------------------------
    # RUN KRISHIMITRA DISEASE MODEL
    # -------------------------------------------------

    try:

        prediction = predict_disease(
            pil_image
        )

    except Exception as error:

        print(
            "Disease prediction error:",
            error,
        )

        raise HTTPException(
            status_code=500,

            detail=(
                "KrishiMitra AI could not "
                "analyse this image."
            ),
        )


    # -------------------------------------------------
    # RETURN DISEASE RESULT
    # -------------------------------------------------

    return {
        "status": "success",

        "message": (
            "Crop image analysed "
            "successfully."
        ),

        "filename": image.filename,

        "contentType": (
            image.content_type
        ),

        "size": len(image_bytes),

        "prediction": prediction,

        "modelConnected": True,
    }


# =====================================================
# SOIL INTELLIGENCE
# =====================================================

@app.post("/api/soil/analyze")
def analyze_soil(
    soil: SoilAnalysisRequest
):

    try:

        result = analyse_soil(

            nitrogen=soil.nitrogen,

            phosphorus=soil.phosphorus,

            potassium=soil.potassium,

            npk_unit=soil.npkUnit,

            ph=soil.ph,

            moisture=soil.moisture,

            temperature=soil.temperature,
        )

        return result


    # -------------------------------------------------
    # INVALID SOIL DATA
    # -------------------------------------------------

    except ValueError as error:

        raise HTTPException(
            status_code=400,

            detail=str(error),
        )


    # -------------------------------------------------
    # INTERNAL ERROR
    # -------------------------------------------------

    except Exception as error:

        print(
            "KrishiMitra soil "
            "analysis error:",
            error,
        )

        raise HTTPException(
            status_code=500,

            detail=(
                "KrishiMitra Soil "
                "Intelligence could not "
                "analyse this report."
            ),
        )