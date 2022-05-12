const Geometry = require('../src/libs/gl-sprite-manager/geometry/index')

describe('RectInRect', function () {
    it ('cas 77', function () {
        expect(Geometry.Helper.rectInRect(-1000, -1000, 50, 100, 155, 358, 1024, 640)).toBeFalsy()
        expect(Geometry.Helper.rectInRect(-100, -1000, 50, 100, 155, 358, 1024, 640)).toBeFalsy()
        expect(Geometry.Helper.rectInRect(-100, -107, 50, 100, 155, 358, 1024, 640)).toBeFalsy()

        expect(Geometry.Helper.rectInRect(100, 300, 55, 58, 155, 358, 1024, 640)).toBeFalsy()
        expect(Geometry.Helper.rectInRect(101, 300, 55, 58, 155, 358, 1024, 640)).toBeFalsy()
        expect(Geometry.Helper.rectInRect(102, 300, 55, 58, 155, 358, 1024, 640)).toBeFalsy()
        expect(Geometry.Helper.rectInRect(101, 301, 55, 58, 155, 358, 1024, 640)).toBeTruthy()
        expect(Geometry.Helper.rectInRect(100, 301, 55, 58, 155, 358, 1024, 640)).toBeFalsy()
    })
})



