/** Animation : Classe chargée de calculer les frames d'animation
 * O876 raycaster project
 * 2012-01-01 Raphaël Marandet
 */

const LOOP_CONSTS = {
	NONE: 0,
	FORWARD: 1,
	YOYO: 2,
	RANDOM: 3
}

class Animation {
	constructor({
		start = 0,
		duration = 0,
		count = 1,
		loop = 0
	} = {}) {
		this._frozen = true;
		this._start = start; // frame de début
		this._index = 0; // index de la frame en cours d'affichage
		this._count = count; // nombre total de frames
		this._duration = duration; // durée de chaque frame, plus la valeur est grande plus l'animation est lente
		this._time = 0; // temps
		this._loop = loop; // type de boucle 1: boucle forward; 2: boucle yoyo 3: random
		this._frame = 0; // Frame actuellement affichée
		this._loopDir = 1; // direction de la boucle (pour yoyo)
	  	this._over = false;
	}

	static get LOOP () {
		return LOOP_CONSTS
	}

	animate (nInc) {
		if (this._frozen) {
			return this._frame;
		}
		if (this._count <= 1 || this._duration === 0) {
			return this._index + this._start;
		}
		this._time += nInc;
		// Dépassement de duration (pour une seule fois)
		if (this._time >= this._duration) {
			this._time -= this._duration;
			if (this._loop === 3) { // random
				this._index = Math.random() * this._count | 0;
			} else {
				this._index += this._loopDir;
			}
		}
		// pour les éventuels très gros dépassement de duration (pas de boucle)
		if (this._time >= this._duration) {
			this._index += this._loopDir * (this._time / this._duration | 0);
			this._time %= this._duration;
		}

		switch (this._loop) {
			case 0: // none
				if (this._index >= this._count) {
					this._index = this._count - 1;
					this._over = true;
				}
				break;

			case 1: // forward
				if (this._index >= this._count) {
					this._index = 0;
				}
				break;

			case 2: // yoyo
				if (this._index >= this._count) {
					this._index = this._count - 1;
					this._loopDir = -1;
				}
				if (this._index <= 0) {
					this._loopDir = 1;
					this._index = 0;
				}
				break;

			default:
				if (this._index >= this._count) {
					this._index = this._count - 1;
				}
		}
		this._frame = this._index + this._start;
		return this._frame;
	}

	reset () {
		this._index = 0;
		this._time = 0;
		this._loopDir = 1;
		this._over = false;
	}

	get over () {
		return this._over;
	}

	get index () {
		return this._index
	}
}

export default Animation;