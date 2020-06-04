const modHelper = require('./enum');
// const md5 = require("./md5");

const versionOptions = {
    'v1': {
        defaultReader: 'bidDataLine',
    },
    'v1-hash': {
        defaultReader: 'hashDataLine',
    }
}

class Reader {
    constructor(strPool, options = {}) {
        this.maps = [];
        this.stages = {};
        this.currentStage = undefined;
        this.currentMod = undefined;
        this.currentSelector = undefined;
        this.currentSubmitter = undefined;
        this.instruction = strPool.split("\n");
        this.readDone = false;
        this.removeDuplicate = options.removeDuplicate || true;
        this.defaultReader = 'bidDataLine';
    }
    readAll() {
        this.instruction.map(line => this.readLine(line));
        this.readDone = true;
        return this.stages;
    }
    toList() {
        if (!this.readDone) this.readAll();
        return Object.entries(this.stages).reduce((acc, [, modMaps]) => {
            acc.push(...Object.entries(modMaps).reduce((acc, [, maps]) => {
                //if (this.removeDuplicate) maps = this.uniqList(maps);
                acc.push(...maps.map(map => {
                    return map;
                }))
                return acc;
            }, []))
            return acc;
        }, [])
    }
    readLine(line) {
        if(!line) return;
        if (line.startsWith('.')) {
            //instruction line
            this.instructionLine(line);
        } else if (line.startsWith("*")) {
            this.advancedDataLine(line);
        } else if (line.startsWith('#')) {
            this.optionsLine(line);
        } else {
            this[this.defaultReader](line);
        }
    }
    instructionLine(line) {
        Object.entries({
            '.stage': 'switchStage',
            '.mods': 'switchMod',
            '.selector': 'switchSelector',
            '.submitter': 'switchSubmitter',
        }).map(([instruction, action]) => {
            this.dispatchAction(instruction, action, line)
        })
    }
    advancedDataLine(line) {
        Object.entries({
            '*json': 'JSONDataLine',
        }).map(([start, action]) => {
            this.dispatchAction(start, action, line)
        })
    }
    optionsLine(line) {
        Object.entries({
            '#version': 'setVersion',
            '#defaultLine': 'setDefaultLineReader'
        }).map(([instruction, action]) => {
            this.dispatchAction(instruction, action, line)
        })
    }
    dispatchAction(instruction, action, line) {
        if (line.startsWith(instruction)) {
            this[action](line.split('=', 2)[1]);
        }
    }
    bidDataLine(data) {
        this.stages[this.currentStage][this.currentMod].push(this.createDataStruct({ id: data }));
    }
    hashDataLine(data) {
        this.stages[this.currentStage][this.currentMod].push(this.createDataStruct({ hash: data }));
    }
    JSONDataLine(data) {
        const json = JSON.parse(data);
        const defaultStruct = this.createDataStruct(json);
        const final = Object.assign(defaultStruct, json);
        if (final.stage !== this.currentStage) {
            this.createStageIfNotExist(final.stage);
        }
        const rawMod = modHelper.toEnum(final.mods);
        if (!this.stages[final.stage][rawMod]) {
            this.createModIfNotExists(rawMod, final.stage);
        }
        this.stages[final.stage][rawMod].push(final);
    }
    createDataStruct(data) {
        return ({
            id: data.id,
            hash: data.hash,
            stage: this.currentStage,
            mods: modHelper.toModList(this.currentMod),
            selector: this.currentSelector,
            submitter: this.currentSubmitter,
        })
    }
    createStageIfNotExist(stage) {
        if (!this.stages[stage]) {
            this.stages[stage] = {};
        }
    }
    createModIfNotExists(mods, stage = this.currentStage) {
        if (!this.stages[stage][mods]) {
            this.stages[stage][mods] = [];
        }
    }
    switchStage(stage) {
        this.createStageIfNotExist(stage);
        this.currentStage = stage;
    }
    switchSelector(selector) {
        this.currentSelector = selector;
    }
    switchSubmitter(submitter) {
        this.currentSubmitter = submitter;
    }
    switchMod(value) {
        const mods = value.split(',');
        const rawMod = modHelper.toEnum(mods);
        if (!this.currentStage) {
            throw new Error('stage undefined');
        }
        this.createModIfNotExists(rawMod);
        this.currentMod = rawMod;
    }
    setVersion(version) {
        if (versionOptions[version]) {
            const options = versionOptions[version];
            Object.entries(options).map(([k, v]) => {
                this[k] = v;
            })
        }
    }
    setDefaultLineReader(lineReader) {
        Object.entries({
            hash: 'hashDataLine',
        }).map(([type, reader]) => {
            if (type == lineReader) {
                this.defaultReader = reader;
            }
        })

    }
    uniqList(list) {
        return Array.from(new Set(list));
    }
}

// const test = [
//     '#version=v1',
//     '.selector=1123053',
//     '.submitter=1123053',
//     '.stage=stage1',
//     '.mods=',
//     1123123,
//     '*json={"hash":"114514","stage":"stage3","mods":["HR","DT"],"selector":"1123053","submitter":"1123053"}',
//     '.mods=HD,DT',
//     1573320,
//     1951733,
//     '.mods=DT',
//     1762429,
//     '.mods=HR',
//     1816243,
//     '#defaultLine=hash',
//     md5('114514'),
// ].join("\n");

// // console.log(test);
// const reader = new Reader(test);
// const result = reader.toList();
// console.log(JSON.stringify(result, null, 2));

module.exports = Reader
