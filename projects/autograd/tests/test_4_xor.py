from train_xor import train_xor

XOR = [([0.0, 0.0], -1.0), ([0.0, 1.0], 1.0), ([1.0, 0.0], 1.0), ([1.0, 1.0], -1.0)]


def test_mlp_fits_all_four_xor_points():
    model = train_xor(hidden=4)
    for x, y in XOR:
        assert model(x).data * y > 0, f"XOR{tuple(x)} should be {y:+.0f}, got {model(x).data:+.3f}"
