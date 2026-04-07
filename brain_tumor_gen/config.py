import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    UPLOAD_FOLDER = "static/uploads"
    OUTPUT_FOLDER = "static/outputs"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    # 模型参数
    IMAGE_SIZE = 256
    DEVICE = "cpu"  # 改为 "cpu" 如果没有GPU

    # BraTS 数据路径（用于真实纹理迁移，无需模型）
    BRATS_DATA_ROOT = r"D:\ProgramCode\BraTSReg_Validation_Data"

    # VAE 路径（本地路径 或 HuggingFace model id）
    # 下载命令：huggingface-cli download stabilityai/sd-vae-ft-mse --local-dir C:\models\vae
    VAE_PATH = r"D:\ProgramCode\brain_tumor_gen\models"

    # 扩散模型参数
    DIFFUSION_STEPS = 50
    GUIDANCE_SCALE = 7.5

    # 侵袭先验参数
    DIFFUSION_COEFF = 0.1
    PROLIFERATION_RATE = 0.3
    INVASION_STEPS = 50
