describe('Bag', function() {

    it('should throw exception if trying to add a field with an invalid field name', function() {
        var bag = new Bag();
        expect(function(){
            bag.add(1, {});
        }).toThrow('Invalid field name, field name must be a string');
    });

    it('should throw exception if trying to add a field with invalid options', function() {
        var bag = new Bag();
        expect(function(){
            bag.add('name', 1);
        }).toThrow('Invalid options, options must be an Object');
    });

    it('should have a required field', function() {
        var bag = new Bag();
        bag.add('name', {
            required: true
        });
        expect(bag.fields.name.required).toBe(true);
    });

    it('should have a required field with default value', function() {
        var bag = new Bag();
        bag.add('name', {
            required: true,
            defaultValue: 'John'
        });
        expect(bag.fields.name.required).toBe(true);
        expect(bag.fields.name.defaultValue).toBe('John');
    });

    it('should use default value if field is null', function() {
        var bag = new Bag();
        bag.add('name', {
            required: true,
            defaultValue: 'John'
        });
        expect(bag.fields.name.required).toBe(true);
        expect(bag.fields.name.defaultValue).toBe('John');
        var processed = bag.put({
            name: null
        });
        expect(processed.name).toBe('John');
    });

    it('should support nested fields', function() {
        var bag = new Bag();
        bag.add('address', {
            fields: {
                number:  { required: true },
                street:  { fields: {
                    type: {
                        required: true,
                        defaultValue: 'street'
                    },
                    name: {
                        required: true
                    }
                }}
            }
        });
        expect(bag.fields.address).toBeDefined();
        expect(bag.fields.address.fields).toBeDefined();
        expect(bag.fields.address.fields.number).toBeDefined();
        expect(bag.fields.address.fields.number.required).toBe(true);
        expect(bag.fields.address.fields.street).toBeDefined();

        expect(bag.fields.address.fields.street.fields).toBeDefined();
        expect(bag.fields.address.fields.street.fields.type).toBeDefined();
        expect(bag.fields.address.fields.street.fields.type.required).toBe(true);
        expect(bag.fields.address.fields.street.fields.type.defaultValue).toBe('street');
        expect(bag.fields.address.fields.street.fields.name).toBeDefined();
        expect(bag.fields.address.fields.street.fields.name.required).toBe(true);
    });

    it('should throw exception if an object field is not set and has required sub fields', function() {
        var bag = new Bag();
        bag.add('address', {
            fields: {
                number:  { required: false },
                street:  { fields: {
                    type: {
                        required: true,
                        defaultValue: 'street'
                    },
                    name: {
                        required: true
                    }
                }}
            }
        });
        expect(function(){
            bag.put({});
        }).toThrow('Encountred required sub field "name" for non existing field "address"');
    });

    it('should automatically append field if sub fields are required with default value', function() {
        var bag = new Bag();
        bag.add('fullname', {
            fields: {
                firstname: {
                    required: true,
                    defaultValue: 'John'
                },
                lastname: {
                    required: true,
                    defaultValue: 'Doe'
                }
            }
        });
        bag.add('address', {
            fields: {
                number: {
                    required: true,
                    defaultValue: 0
                },
                type: {
                    required: true,
                    defaultValue: 'street'
                },
                country: {}
            }
        });
        expect(bag.put({})).toEqual({
          fullname: {
            firstname: 'John',
            lastname: 'Doe'
          },
          address: {
            number: 0,
            type: 'street'
          }
        });
    });

    it('should output a string representation of the bag config for non nested fields', function() {
        var bag = new Bag();
        bag.add('firstname', { required: true })
           .add('lastname',  { required: true });
        expect(bag.toString()).toBe("firstname: { required: true, defaultValue: null }\nlastname: { required: true, defaultValue: null }\n");
    });

    it('should output a string representation of the bag config for nested fields', function() {
        var bag = new Bag();
        bag.add('firstname', { required: true })
           .add('lastname',  { required: true })
           .add('address', {
               fields: {
                   number: { required: true },
                   street: { required: true }
               }
           });
        expect(bag.toString()).toBe("firstname: { required: true, defaultValue: null }\nlastname: { required: true, defaultValue: null }\naddress: {\n  number: { required: true, defaultValue: null }\n  street: { required: true, defaultValue: null }\n}\n");
    });
});