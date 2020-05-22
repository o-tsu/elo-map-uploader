const rawMod = {
    NM: 0,
    EZ: 2,
    HD: 8,
    HR: 16,
    DT: 64,
    HT: 256,
    TB: 65536
};
const helper = {
    toEnum: function (mods) {
        return mods.reduce((acc, mod) => {
            // console.log('convert to rawMod: ', mod, rawMod[mod]);
            if (rawMod[mod] !== undefined) {
                return acc += rawMod[mod];
            }
        }, 0)
    },
    toModList: function (rawmod) {
        const mods = Object.entries(rawMod).reduce((acc, [mod, value]) => {
            if (value & rawmod) {
                acc.push(mod);
            }
            return acc;
        }, [])
        if (mods.length == 0) {
            mods.push('NM')
        }
        return mods;
    }
}

module.exports = helper