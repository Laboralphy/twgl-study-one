/**
 * Created by ralphy on 07/09/17.
 */

const LOOK_UP_CMP_POINT_IN_RECT = [
	[0, 0, 0, 0],
	[0, 7, 4, 1],
	[0, 8, 5, 2],
	[0, 9, 6, 3]
]

const LOOK_UP_RECT_IN_RECT = [
	null, // 0x err
	false, // 1x too low
	false, // 2x too low
	false, // 3x too low & too right
	[ // 4x
		null,   // 40 err
		false,	// 41 out
		true,	// 42 in
		true,	// 43 in
		false,	// 44 out
		true,	// 45 in
		true,	// 46 in
		null,	// 47 err
		null,	// 48 err
		null	// 49 err
	],
	true, // 5 inside
	false, // 6 too right
	[ // 7x
		null,   // 70 err
		false,  // 71
		true,   // 72
		true,   // 73
		false,  // 74
		true,   // 75
		true,   // 76
		false,  // 77
		false,  // 78
		false   // 79
	],
	[ // 8x
		null,   // 80 err
		null,   // 81 err
		true,   // 82
		true,   // 83
		null,   // 84 err
		true,   // 85
		true,   // 86
		null,   // 87 err
		false,  // 88
		false   // 89
	],
	false, // 9 too right
]

/**
 * A simple helper class
 */
class Helper {
	/**
	 * Distance between 2 points
	 * @param x1 {Number} point 1 coordinates
	 * @param y1 {Number}
	 * @param x2 {Number} point 2 coordinates
	 * @param y2 {Number}
	 * @return {number} distance
	 */
	static distance(x1, y1, x2, y2) {
		let dx = x1 - x2;
		let dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Squared Distance between 2 points
	 * @param x1 {Number} point 1 coordinates
	 * @param y1 {Number}
	 * @param x2 {Number} point 2 coordinates
	 * @param y2 {Number}
	 * @return {number} distance
	 */
	static squareDistance(x1, y1, x2, y2) {
		let dx = x1 - x2;
		let dy = y1 - y2;
		return dx * dx + dy * dy;
	}

	/**
	 * Renvoie true si le point est dans le rectangle
     * @param x {number} coordonnée du point
     * @param y {number} coordonnée du point
     * @param xr {number} coordonnée du rect
     * @param yr {number} coordonnée du rect
     * @param wr {number} largeur du rect
     * @param hr {number} hauteur du rect
     * @return {boolean}
     */
	static pointInRect(x, y, xr, yr, wr, hr) {
		return Helper._cmpPointRect(x, y, xr, yr, wr, hr) === 5
	}

	/**
	 * Compare une valeur à un Range
	 * @param n {number}
	 * @param nMin {number}
	 * @param nMax {number}
	 * @returns {number}
	 */
	static _cmpRange (n, nMin, nMax) {
		return n < nMin
			? 1
			: n > nMax
				? 3
				: 2
	}

	/**
	 * Compare un point à un rectangle. Renvoie un indicateur de comparaison
	 * @returns {number} Indicateur de comparaison. Voir valeur ci dessous
	 * 1 : le point est situé "en bas à gauche" du rectangle
	 * 2 : le point est situé "en bas" du rectangle
	 * 3 : le point est situé "en bas à droite" du rectangle
	 * 4 : le point est situé "à gauche" du rectangle
	 * 5 : le point est à l'intérieur du rectangle
	 * 6 : le point est situé "à droite" du rectangle
	 * 7 : le point est situé "en haut à gauche" du rectangle
	 * 8 : le point est situé "en haut" du rectangle
	 * 9 : le point est situé "en haut à droite" du rectangle
	 * @param x {number} coordonnée x du point
	 * @param y {number} coordonnée y du point
	 * @param rx {number} coordonnée x du point topleft du rectangle
	 * @param ry {number} coordonnée y du point topleft du rectangle
	 * @param rw {number} largeur du rectangle
	 * @param rh {number} hauteur du rectangle
	 */
	static _cmpPointRect (x, y, rx, ry, rw, rh) {
		const cx = Helper._cmpRange(x, rx, rx + rw - 1)
		const cy = Helper._cmpRange(y, ry, ry + rh - 1)
		return LOOK_UP_CMP_POINT_IN_RECT[cx][cy]
	}

	static rectInRect (ax, ay, aw, ah, bx, by, bw, bh) {
		const p1 = Helper._cmpPointRect(ax, ay, bx, by, bw, bh)
		const t1 = LOOK_UP_RECT_IN_RECT[p1]
		if (typeof t1 === 'boolean') {
			return t1
		}
		const p2 = Helper._cmpPointRect(ax + aw - 1, ay + ah - 1, bx, by, bw, bh)
		return t1[p2]
	}

	/**
	 * Renvoie l'ange que fait la doite x1, y1, x2, y2
	 * avec l'axe des X+
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
	 * @return {number}
     */
	static angle(x1, y1, x2, y2) {
		return Math.atan2(y2 - y1, x2 - x1);
	}

	/**
	 * A partir d'un angle et d'une norme, calcule deux composant d'un référentiel rectangulaire
	 * @param angle
	 * @param norm
	 */
	static polar2rect(angle, norm) {
		return {dx: norm * Math.cos(angle), dy: norm * Math.sin(angle)};
	}

	/**
	 * Délimite une région rectangulaire contenant tous les points
	 * @param aPoints {array}
	 * @return {array}
	 */
	static getRegion(aPoints) {
		let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
		aPoints.forEach(p => {
			xMin = Math.min(p.x, xMin);
			yMin = Math.min(p.y, yMin);
			xMax = Math.max(p.x, xMax);
			yMax = Math.max(p.y, yMax);
		});
		return [{
			x: xMin,
			y: yMin
		}, {
			x: xMax,
			y: yMax
		}];
	}
}

module.exports = Helper;