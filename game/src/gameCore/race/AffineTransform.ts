export default class AffineTransform {
	// Linear transform
	// |u1 v1|
	// |u2 v2|
	u1: number;
	u2: number;
	v1: number;
	v2: number;

	// Translation
	// |b1|
	// |b2|
	b1: number;
	b2: number;

	public constructor(
		linearTransformEntry_u1: number,
		linearTransformEntry_u2: number,
		linearTransformEntry_v1: number,
		linearTransformEntry_v2: number,
		translationEntry_b1: number,
		translationEntry_b2: number
	) {
		this.u1 = linearTransformEntry_u1;
		this.u2 = linearTransformEntry_u2;
		this.v1 = linearTransformEntry_v1;
		this.v2 = linearTransformEntry_v2;
		this.b1 = translationEntry_b1;
		this.b2 = translationEntry_b2;
	}

	// |u1 v1| |x| + |b1|
	// |u2 v2| |y|   |b2|
	public apply(point: Point): Point {
		return { x: this.u1 * point.x + this.v1 * point.y + this.b1, y: this.u2 * point.x + this.v2 * point.y + this.b2 };
	}

	public applyLinearTransform(point: Point): Point {
		return { x: this.u1 * point.x + this.v1 * point.y, y: this.u2 * point.x + this.v2 * point.y };
	}

	public applyTranslation(point: Point): Point {
		return { x: point.x + this.b1, y: point.y + this.b2 };
	}
}
