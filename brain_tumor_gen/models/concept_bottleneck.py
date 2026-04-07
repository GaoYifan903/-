"""
Concept Bottleneck Layer
将隐向量映射到可解释的医学语义概念
"""
import torch
import torch.nn as nn


CONCEPTS = [
    "tumor_core",        # 肿瘤核心
    "necrosis",          # 坏死区
    "edema",             # 水肿
    "enhancement_ring",  # 强化环
    "boundary_clarity",  # 边界清晰度
    "mass_effect",       # 占位效应
]


class ConceptBottleneck(nn.Module):
    """
    将 UNet 中间层特征映射到语义概念分数
    每个概念分数对应一个可解释的医学属性
    """
    def __init__(self, latent_dim: int = 512, num_concepts: int = len(CONCEPTS)):
        super().__init__()
        self.concept_layer = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.ReLU(),
            nn.Linear(256, num_concepts),
            nn.Sigmoid()  # 每个概念分数 [0, 1]
        )
        self.concept_names = CONCEPTS

    def forward(self, z: torch.Tensor) -> dict:
        scores = self.concept_layer(z)
        return {
            name: scores[:, i].item()
            for i, name in enumerate(self.concept_names)
        }


def concept_scores_to_report(scores: dict, grade: int, shape: str) -> dict:
    """将概念分数转换为医生可读的解释报告"""
    report = {
        "概念分析": {
            "肿瘤核心活性": f"{scores.get('tumor_core', 0):.2f}",
            "坏死程度": f"{scores.get('necrosis', 0):.2f}",
            "水肿范围": f"{scores.get('edema', 0):.2f}",
            "强化环特征": f"{scores.get('enhancement_ring', 0):.2f}",
            "边界清晰度": f"{scores.get('boundary_clarity', 0):.2f}",
            "占位效应": f"{scores.get('mass_effect', 0):.2f}",
        },
        "生成条件摘要": {
            "WHO分级": grade,
            "形态类型": shape,
            "侵袭风险": _invasion_risk(grade, scores),
        },
        "注意事项": _generate_notes(grade, scores)
    }
    return report


def _invasion_risk(grade: int, scores: dict) -> str:
    risk = grade * 0.25 + scores.get("edema", 0) * 0.3 + scores.get("necrosis", 0) * 0.2
    if risk > 0.7:
        return "高风险"
    elif risk > 0.4:
        return "中风险"
    return "低风险"


def _generate_notes(grade: int, scores: dict) -> list:
    notes = []
    if grade >= 3:
        notes.append("高级别胶质瘤，建议关注强化区域")
    if scores.get("edema", 0) > 0.7:
        notes.append("水肿范围较大，注意颅内压")
    if scores.get("necrosis", 0) > 0.6:
        notes.append("坏死区明显，提示肿瘤中心缺血")
    if not notes:
        notes.append("图像特征在正常生成范围内")
    return notes
