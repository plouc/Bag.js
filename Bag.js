/**
 * Bag class.
 * Lightweight wrapper for javascript config objects.
 *
 * @author Raphaël Benitte <benitterapheal@gmail.com>
 * @since  2012-11-06
 */
var Bag = function() {
    this.fields = {};
};
Bag.prototype = {

    seto: function(options) {
        var processedOptions = {};
        if (options.hasOwnProperty('fields')) {

            // options must be an object
            if ({}.toString.call(options) !== '[object Object]') {
                throw 'Field fields must be an object';
            }

            processedOptions.fields = {};
            for (var fieldName in options.fields) {
                if (options.fields.hasOwnProperty(fieldName)) {
                    processedOptions.fields[fieldName] = this.seto(options.fields[fieldName]);
                }
            }
        } else {
            processedOptions.required = !!(options.hasOwnProperty('required') && options.required === true);
            processedOptions.defaultValue = options.hasOwnProperty('defaultValue') ? options.defaultValue : null;
        }

        return processedOptions;
    },

    /**
     * Add a field with options.
     *
     * @param fieldName the field name
     * @param options   an object with field config
     * @return Bag
     */
    add: function(fieldName, options) {

        // field name must be a valid property name
        if ({}.toString.call(fieldName) !== '[object String]') {
            throw 'Invalid field name, field name must be a string';
        }

        if ({}.toString.call(options) === '[object Object]') {
            this.fields[fieldName] = this.seto(options);
        } else {
            throw 'Invalid options, options must be an Object';
        }

        return this;
    },

    /**
     * Repeat a String n times.
     *
     * @param str   string to repeat
     * @param count repeat count
     * @return String
     */
    repeatString: function(str, count) {
        var repeated = "";
        for (var a = 0; a < count; a++) {
            repeated += str;
        }
        return repeated;
    },

    /**
     * Returns a string representation of the Bag.
     *
     * @param fields [optional] an object with field config
     * @param depth  [optional] an integer representing current field depth in the Bag
     * @return String
     */
    toString: function(fields, depth) {

        fields = fields || this.fields;
        depth  = depth  || 0;

        var fieldsString = '';

        for (var fieldName in fields) {
            if (fields.hasOwnProperty(fieldName)) {
                var fieldOptions = fields[fieldName];
                if (fieldOptions.hasOwnProperty('fields')) {
                    fieldsString += this.repeatString(" ", depth * 2) + fieldName + ": {\n";
                    fieldsString += this.toString(fieldOptions.fields, depth + 1);
                    fieldsString += this.repeatString(" ", depth * 2) + "}\n";
                } else {
                    fieldsString += this.repeatString(" ", depth * 2) + fieldName + ": { ";
                    fieldsString += "required: " + fieldOptions.required + ', ';
                    fieldsString += "defaultValue: " + fieldOptions.defaultValue + " }\n";
                }
            }
        }

        return fieldsString;
    },

    /**
     * Check if a field is required by traversing all its children.
     * if it returns false, it found no required field,
     * if it returns 'a+', it means field should be automatically added
     * because there is required fields, but it has a defaultValue,
     * other returned value means there is a required field without defaultValue.
     *
     * @todo try to find another approach to return append instruction
     *
     * @param fields
     * @return mixed
     */
    isObjectRequired: function(fields) {

        var isRequired = false;

        for (var fieldName in fields) {
            if (fields.hasOwnProperty(fieldName)) {
                var fieldConfig = fields[fieldName];
                if (fieldConfig.hasOwnProperty('required') && fieldConfig.required === true) {
                    if (fieldConfig.defaultValue !== null && fieldConfig.defaultValue !== undefined) {
                        isRequired = 'a+'; // send an append instruction
                    } else {
                        return fieldName;
                    }
                } else if (fieldConfig.hasOwnProperty('fields')) {
                    var isSubRequired = this.isObjectRequired(fieldConfig.fields);
                    if (isSubRequired !== false && isSubRequired !== 'a+') {
                        return isSubRequired;
                    }
                }
            }
        }

        return isRequired;
    },

    put: function(config, options) {

        if ({}.toString.call(config) !== '[object Object]') {
            throw 'Invalid config, config must be an Object';
        }

        options = options || this.fields;
        for (var fieldName in options) {

            if (options.hasOwnProperty(fieldName)) {

                var fieldOptions = options[fieldName];

                // for object fields
                if (fieldOptions.hasOwnProperty('fields')) {
                    if (!config.hasOwnProperty(fieldName)) {
                        var isRequired = this.isObjectRequired(fieldOptions.fields);
                        if (isRequired !== false) {
                            if (isRequired === 'a+') {
                                config[fieldName] = this.put({}, fieldOptions.fields);
                            } else {
                                throw 'Encountred required sub field "' + isRequired + '" for non existing field "' + fieldName + '"';
                            }
                        }
                    } else {
                        config[fieldName] = this.put(config[fieldName], fieldOptions.fields);
                    }

                // for flat field
                } else {
                    if (fieldOptions.required === true
                     && (config.hasOwnProperty(fieldName) || config[fieldName] === null || config[fieldName] === undefined)) {
                        if (fieldOptions.defaultValue !== null && fieldOptions.defaultValue !== undefined) {
                            config[fieldName] = fieldOptions.defaultValue;
                        } else {
                            throw 'Field "' + fieldName + '" is required and does not have a default value';
                        }
                    }
                }
            }
        }

        return config;
    }
};