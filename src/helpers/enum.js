const rawMod = {
    NM: 0,
    NF: 1,
    EZ: 2,
    HD: 8,
    HR: 16,
    SD: 32,
    DT: 64,
    RX: 128,
    HT: 256,
    NC: 512,
    FL: 1024,
    AT: 2048,
    SO: 4096,
    AP: 8192,
    PF: 16384,
    FM: 536870912,
    // FMA: 522171579,
    TB: 1073741824,
};
// const Mods = {
//     'None': 0,
//     'NoFail': 1,
//     'Easy': 1 << 1,
//     'TouchDevice': 1 << 2,
//     'Hidden': 1 << 3,
//     'HardRock': 1 << 4,
//     'SuddenDeath': 1 << 5,
//     'DoubleTime': 1 << 6,
//     'Relax': 1 << 7,
//     'HalfTime': 1 << 8,
//     'Nightcore': 1 << 9, // DoubleTime mod
//     'Flashlight': 1 << 10,
//     'Autoplay': 1 << 11,
//     'SpunOut': 1 << 12,
//     'Relax2': 1 << 13, // Autopilot
//     'Perfect': 1 << 14, // SuddenDeath mod
//     'Key4': 1 << 15,
//     'Key5': 1 << 16,
//     'Key6': 1 << 17,
//     'Key7': 1 << 18,
//     'Key8': 1 << 19,
//     'FadeIn': 1 << 20,
//     'Random': 1 << 21,
//     'Cinema': 1 << 22,
//     'Target': 1 << 23,
//     'Key9': 1 << 24,
//     'KeyCoop': 1 << 25,
//     'Key1': 1 << 26,
//     'Key3': 1 << 27,
//     'Key2': 1 << 28,
//     'KeyMod': 521109504,
//     'FreeModAllowed': 522171579,
//     'ScoreIncreaseMods': 1049662
// },
const helper = {
    toEnum: function (mods) {
        // console.log(mods);
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
        // console.log({ rawmod, mods })
        return mods;
    }
}

module.exports = helper