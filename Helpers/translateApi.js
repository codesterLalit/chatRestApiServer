var sync  = require('synchronize');
var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

module.exports = {
  read : (_from, _to,text,callback) =>{
    var languageTranslator = new LanguageTranslatorV3({
    version: '2018-05-01',
    iam_apikey: '18Atr9s8b-YsghImJkf2xJRwD2JfBTEcQTvjvJroI-pr',
    url: 'https://gateway.watsonplatform.net/language-translator/api'
    });

    var to = _to;
    var from = _from;
    var textToTranslate = text;


    var parameters = {
      text: textToTranslate,
      model_id: `${from}-${to}`
    };


    languageTranslator.translate(parameters, function(err, response){
      if (err){
        console.log(err)
      }
      else{
        callback(null,  response.translations[0].translation);
          }
       })
  }
}
// We can use the `sync` helper here to avoid using `await()` and `defer()` manually.
