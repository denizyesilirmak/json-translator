const { Translate } = require('@google-cloud/translate').v2
const args = require("args-parser")(process.argv)
const fs = require('fs')
const languageList = require('./languages.json')
require('dotenv').config()

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS)

const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: CREDENTIALS.project_id
})

const translateText = async (text, targetLanguage) => {
  try {
    let [response] = await translate.translate(text, targetLanguage)
    return response
  } catch (error) {
    console.log(`Error at translateText --> ${error}`)
    return 0
  }
}

const translate_strings_obj = async (str_obj, targetLang) => {
  return new Promise(async (resolve, reject) => {
    let result = {}
    for (const e in str_obj) {
      result[e] = await translateText(str_obj[e], targetLang)
    }
    resolve(result)
  })

}

const writeToFile = (path, content) => {
  fs.writeFileSync(path, content)
}

const jsonTranslator = async () => {
  let outputLanguageCode = args['l']
  let fileName = args['i']
  let outputFileName = args['o']

  if (args.help ||
    Object.keys(args).length === 0 ||
    !Object.keys(args).includes('i') ||
    !Object.keys(args).includes('o') ||
    !Object.keys(args).includes('l')
  ) {
    console.log(`
      -a=de Input language ISO code
      -b=tr Output language ISO code
      -i=test.json File to translate
    `)
    return
  }

  const path = (`${__dirname}/${fileName}`)
  const outputPath = (`${__dirname}/${outputFileName}`)
  const file = fs.readFileSync(path, 'utf8')
  const jsonFile = JSON.parse(file)

  const outputJson = await translate_strings_obj(jsonFile, outputLanguageCode)
  writeToFile(outputPath, JSON.stringify(outputJson))
}

jsonTranslator()