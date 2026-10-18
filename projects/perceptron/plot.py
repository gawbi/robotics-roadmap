"""AND·OR·XOR 를 학습시켜 수렴한 epoch 를 출력하고, decision boundary 그림을 results/decision_boundary.png 로 저장한다."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt

from perceptron import predict, train

RESULTS = Path(__file__).parent / "results"
LIM = (-0.5, 1.5)

POINTS = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]
TRUTH_TABLES = {
    "AND": [0, 0, 0, 1],
    "OR": [0, 1, 1, 1],
    "XOR": [0, 1, 1, 0],
}


def plot_boundary(ax: plt.Axes, w: list[float], b: float) -> None:
    """ŷ = 1 인 영역을 칠하고 직선 w_1 x_1 + w_2 x_2 + b = 0 을 그린다. 직선 위의 점은 ŷ = 0 이다."""
    n = 200
    grid = [LIM[0] + (LIM[1] - LIM[0]) * k / (n - 1) for k in range(n)]
    region = [[predict(w, b, [x1, x2]) for x1 in grid] for x2 in grid]
    ax.contourf(grid, grid, region, levels=[0.5, 1.5], colors=["C1"], alpha=0.15)
    w1, w2 = w
    if w2 != 0:
        xs = [LIM[0], LIM[1]]
        ax.plot(xs, [-(w1 * x1 + b) / w2 for x1 in xs], color="C3")
    elif w1 != 0:
        ax.axvline(-b / w1, color="C3")


def main() -> None:
    RESULTS.mkdir(exist_ok=True)
    fig, axes = plt.subplots(1, 3, figsize=(12, 4))
    for ax, (name, labels) in zip(axes, TRUTH_TABLES.items()):
        data = list(zip(POINTS, labels))
        w, b, epoch = train(data, lr=0.1, max_epochs=10_000)
        print(f"{name}: converged_epoch = {epoch}, w = {w}, b = {b}")

        for y, color in ((0, "C0"), (1, "C1")):
            pts = [x for x, label in data if label == y]
            ax.scatter([p[0] for p in pts], [p[1] for p in pts], s=120, color=color, label=f"y = {y}", zorder=3)
        plot_boundary(ax, w, b)
        ax.set_xlim(LIM)
        ax.set_ylim(LIM)
        ax.set_aspect("equal")
        ax.set_xlabel("$x_1$")
        ax.set_ylabel("$x_2$")
        status = f"converged at epoch {epoch}" if epoch is not None else "not converged in 10,000 epochs"
        ax.set_title(f"{name} ({status})")

    handles, labels = axes[0].get_legend_handles_labels()
    fig.legend(handles, labels, loc="lower center", ncol=2)
    fig.tight_layout(rect=(0, 0.08, 1, 1))
    fig.savefig(RESULTS / "decision_boundary.png", dpi=150)
    plt.close(fig)


if __name__ == "__main__":
    main()
