#Bag.js

**A simple validator for javascript config objects**

## Features
* Checks field requirement
* Allow setting a default value for a required field
* Nested fields (sub objects)

## Usage
```javascript
var bag = new Bag();
bag.add('firstname', { required: true });
bag.add('lastname', { required: true });
var personConfig = bag.put({
    firstname: 'John',
    lastname: 'Doe'
});
```