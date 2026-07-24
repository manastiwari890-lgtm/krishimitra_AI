# KrishiMitra AI — Crop Disease Detection Model

## Model Version

KrishiMitra Disease Detection Model V1

Model file:

krishimitra_disease_model_v1.pth


## Model Architecture

Architecture: MobileNetV3 Large

Framework: PyTorch

Training technique: Transfer Learning

Pretrained weights: ImageNet

Input image size:

224 × 224 pixels


## Dataset

Dataset: PlantVillage

Dataset repository:
https://github.com/spMohanty/PlantVillage-Dataset

Image type used:

Color leaf images

Dataset directory used during training:

PlantVillage-Dataset/raw/color


## Crops Supported in V1

KrishiMitra V1 currently supports:

1. Corn / Maize
2. Bell Pepper
3. Potato
4. Tomato


## Disease Classes

Total classes: 19

0 - Corn (maize) — Cercospora leaf spot / Gray leaf spot
1 - Corn (maize) — Common rust
2 - Corn (maize) — Northern Leaf Blight
3 - Corn (maize) — Healthy

4 - Bell Pepper — Bacterial spot
5 - Bell Pepper — Healthy

6 - Potato — Early blight
7 - Potato — Late blight
8 - Potato — Healthy

9 - Tomato — Bacterial spot
10 - Tomato — Early blight
11 - Tomato — Late blight
12 - Tomato — Leaf Mold
13 - Tomato — Septoria leaf spot
14 - Tomato — Spider mites / Two-spotted spider mite
15 - Tomato — Target Spot
16 - Tomato — Tomato Yellow Leaf Curl Virus
17 - Tomato — Tomato mosaic virus
18 - Tomato — Healthy


## Dataset Size

Total selected images:

26,639


## Dataset Split

Stratified dataset splitting was used.

Training:

21,311 images (80%)

Validation:

2,664 images (10%)

Testing:

2,664 images (10%)


## Image Preprocessing

Images are resized to:

224 × 224

ImageNet normalization:

Mean:
[0.485, 0.456, 0.406]

Standard deviation:
[0.229, 0.224, 0.225]


## Training Data Augmentation

Training images used augmentation including:

- Random horizontal flipping
- Random rotation
- Brightness adjustment
- Contrast adjustment
- Saturation adjustment


## Training Environment

Training platform:

Google Colab

GPU:

NVIDIA Tesla T4

Framework:

PyTorch

Epochs:

10

Batch size:

32

Optimizer:

AdamW

Learning rate:

0.0003

Weight decay:

0.0001

Loss function:

CrossEntropyLoss


## Model Performance

Best validation accuracy:

99.29%

Final test accuracy:

99.21%

Test images:

2,664


## Important Limitation

The reported accuracy represents performance on the held-out
PlantVillage test dataset.

It should NOT be interpreted as 99.21% accuracy on arbitrary
real-world farmer photographs.

PlantVillage images are generally captured under more controlled
conditions than real farm images.

KrishiMitra should therefore present disease predictions as
decision-support rather than guaranteed agricultural diagnoses.


## Model Checkpoint

The saved PyTorch checkpoint contains:

- Model weights
- Model architecture identifier
- Number of classes
- Class names
- Image size
- ImageNet normalization values
- Best validation accuracy
- Final test accuracy


## Future Expansion

Future KrishiMitra models should add datasets covering important
Indian crops such as:

- Rice
- Wheat
- Cotton
- Sugarcane
- Mustard

Real field images should also be introduced to improve robustness
under different lighting conditions, backgrounds, camera quality,
leaf orientation, and disease severity.