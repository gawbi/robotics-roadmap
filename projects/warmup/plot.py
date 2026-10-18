"""데이터 위의 직선과 loss curve, learning rate 0.001·0.01·0.05 의 loss curve 비교 그림."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from linreg import fit, make_data

RESULTS = Path(__file__).parent / "results"
YMAX = 1e15


def plot_fit(x: np.ndarray, y: np.ndarray) -> None:
    w, b, loss_history = fit(x, y, lr=0.01, steps=5000)
    fig, (ax_data, ax_loss) = plt.subplots(1, 2, figsize=(11, 4.5))

    ax_data.scatter(x, y, s=12, alpha=0.6, label="data")
    xs = np.linspace(0, 10, 2)
    ax_data.plot(xs, w * xs + b, color="C3", label=f"fit: y = {w:.3f}x + {b:.3f}")
    ax_data.plot(xs, 3 * xs + 2, color="gray", linestyle="--", label="true: y = 3x + 2")
    ax_data.set_xlabel("x")
    ax_data.set_ylabel("y")
    ax_data.legend()

    ax_loss.plot(loss_history)
    ax_loss.set_yscale("log")
    ax_loss.set_xlabel("step")
    ax_loss.set_ylabel("MSE loss")
    ax_loss.set_title("lr = 0.01")

    fig.tight_layout()
    fig.savefig(RESULTS / "fit.png", dpi=150)
    plt.close(fig)


def plot_learning_rates(x: np.ndarray, y: np.ndarray) -> None:
    fig, ax = plt.subplots(figsize=(7, 4.5))
    for lr in (0.001, 0.01, 0.05):
        _, _, loss_history = fit(x, y, lr=lr, steps=5000)
        loss = np.array(loss_history)
        steps = np.arange(1, len(loss) + 1)
        line, = ax.plot(steps, loss, label=f"lr = {lr}")
        nonfinite = np.flatnonzero(~np.isfinite(loss))
        if nonfinite.size:
            off_axis = np.flatnonzero(loss > YMAX)[0]
            ax.axvline(steps[nonfinite[0]], color=line.get_color(), linestyle=":")
            ax.annotate(f"loss > 1e15 at step {steps[off_axis]}\ninf/nan at step {steps[nonfinite[0]]}",
                        (steps[nonfinite[0]], 1e12), xytext=(-8, 0), textcoords="offset points",
                        ha="right", color=line.get_color())
    ax.set_xscale("log")
    ax.set_yscale("log")
    # 발산한 값(최대 ~1e308)에 맞춰 축이 늘어나지 않도록 범위를 고정한다
    ax.set_ylim(0.5, YMAX)
    ax.set_xlabel("step")
    ax.set_ylabel("MSE loss")
    ax.legend()

    fig.tight_layout()
    fig.savefig(RESULTS / "learning_rates.png", dpi=150)
    plt.close(fig)


def main() -> None:
    RESULTS.mkdir(exist_ok=True)
    x, y = make_data()
    plot_fit(x, y)
    # lr 0.05 는 발산해 inf·nan 이 나오므로 overflow 경고를 끈다
    with np.errstate(over="ignore", invalid="ignore"):
        plot_learning_rates(x, y)


if __name__ == "__main__":
    main()
