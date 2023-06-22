import { json2str, str2json } from "../shared/data";
import { readFileSync, writeFileSync } from "../shared/fs"
export const file = 'data.bin';
const logger = DeviceRuntimeCore.HmLogger.getLogger('untils_data.js')

export const jsonExample = {
    "version": "1.0.1",
    'highFPS': false,
    'showFPS': false,
    'record': {
        'score': [
            [],[],[],[]
        ],
        'combo': [
            [],[],[],[]
        ]
    },
    "difficulty": 2
}
 
export function getTargetList(listName) {
    data.json.lists.forEach(object => {
        if(object.name == listName) {
            return object
        }
        else {
            return null
        }
    });
}

export class Data {
    constructor() {
        //logger.log('json=null')
        this.json = null;
        //logger.log('str=read... start')
        let str = readFileSync(file, {});

        //logger.log('str=read... over->' + (str?str:"undefined"));
        if(str == undefined) {
            // create

            //logger.log('str undefined, so')
            //logger.log('create...')
            writeFileSync(file, json2str(jsonExample), {})
            //logger.log('create Done')
            //logger.log('file->json...')
            this.json = str2json(readFileSync(file, {}));

            //logger.log('file2json Done : ', json2str(this.json))
        }
        else {

            //logger.log('str Defined !')

            //logger.log('str->json...')
            this.json = str2json(str);
            //logger.log('str->json done')
        }
        if(this.json.version != jsonExample.version) {
            writeFileSync(file, json2str(jsonExample), {})
            //logger.log('create Done')
            //logger.log('file->json...')
            this.json = str2json(readFileSync(file, {}));
        }
    }
    save(option) {
        writeFileSync(file, json2str(this.json), {})
    }
    reload(option) {
        let str = readFileSync(file, {});
        if(str == undefined) {
            // create
            writeFileSync(file, json2str(jsonExample), {})
            this.json = str2json(readFileSync(file, {}));
        }
        else {
            this.json = str2json(str);
        }
    }
    reset() {
        this.json = jsonExample
        this.save()
    }
}

export const data = new Data()