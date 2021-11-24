const Validations = require('js-validation-tool/core/validations');

module.exports = (e) => ({
  selfDescription: [
    Validations.common.isOptional('selfDescription', e.selfDescription),
    Validations.string.isString('selfDescription', e.selfDescription),
  ],
  language: [
    Validations.common.isOptional('language', e.language),
    Validations.string.isNotEmpty('language', e.language),
  ],
  appTheme: [
    Validations.common.isOptional('appTheme', e.appTheme),
    Validations.string.isNotEmpty('appTheme', e.appTheme),
  ],
});
