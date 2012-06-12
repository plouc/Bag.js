Bag.js
======

simple validator for javascript config objects
```javascript
var bag = new Bag();
bag.add('firstname', { required: true });
bag.add('lastname', { required: true });
var personConfig = bag.put({
    firstname: 'John',
    lastname: 'Doe'
});
```