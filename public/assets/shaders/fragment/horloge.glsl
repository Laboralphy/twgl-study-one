#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 resolution;
uniform vec4 date;

float drawCircle(vec2 vCenter, float fRadius,
	float fThickness,
	vec2 uv) {
	float fDist = distance(vCenter, uv);
	if (fDist < fRadius + fThickness && fDist > fRadius - fThickness) {
		return abs(fDist - fRadius) / fThickness;
	} else {
		return 0.0;
	}
}

float drawLine(vec2 p1, vec2 p2, float fThickness, vec2 uv) {
	float a = abs(distance(p1, uv));
	float b = abs(distance(p2, uv));
	float c = abs(distance(p1, p2));
	if ( a >= c || b >= c ) {
		return 0.0;
	}
	float p = (a + b + c) * 0.5; // median to (p1, p2) vector
	float h = 2.0 / c * sqrt( p * ( p - a) * ( p - b) * (p - c));
	return mix(1.0, 0.0, smoothstep(0.5 * fThickness, 1.5 * fThickness, h));
}

vec2 aimPoint(vec2 vFrom, float fDist, float fAngle) {
	return vec2(
		sin(fAngle),
		cos(fAngle)
	) * fDist + vFrom;
}

#define PI 3.141592654

void main(void) {
	float fTime = date.a;
	float second = mod(fTime, 60.0);
	float hour = mod(floor(fTime / 3600.0), 24.0);
	float minute = mod(floor(fTime / 60.0), 60.0);

	vec2 vClock = vec2(0.5, 0.5);
	float fClockSize = 0.25;


	vec2 uv = gl_FragCoord.xy / resolution.xy;
	float fColor = drawCircle(vClock, fClockSize, 0.05, uv);
	fColor = max(
		fColor,
		drawLine(
			vClock,
			aimPoint(
				vClock,
				fClockSize,
				2.0 * PI * second / 60.0
			),
			0.01,
			uv
		)
	);
	fColor = max(
		fColor,
		drawLine(
			vClock,
			aimPoint(
				vClock,
				fClockSize * 0.9,
				2.0 * PI * minute / 60.0
			),
			0.015,
			uv
		)
	);
	fColor = max(
		fColor,
		drawLine(
			vClock,
			aimPoint(
				vClock,
				fClockSize * 0.7,
				2.0 * PI * hour / 12.0
			),
			0.02,
			uv
		)
	);



	gl_FragColor = vec4(fColor, 0.0, 1.0, 1.0);
}
