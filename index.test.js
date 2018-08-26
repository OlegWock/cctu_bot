const randomElement = require('./index.js').randomElement;


describe('randomElement function', () => {
    const elements = ['one', 'two', 'three'];
    const objects = [{name: "one", criteria: true},
                     {name: "two", criteria: false},
                     {name: "three", criteria: false}];

    test('result should be defined', () => {
        let result = randomElement(elements);

        expect(result).toBeDefined();
    });

    test('plain criteria should filter results correctly', () => {
        let result1 = randomElement(objects, {criteria: true});
        let result2 = randomElement(objects, {name: "one"});

        expect(result1).toBe(objects[0]);
        expect(result2).toBe(objects[0]);
        
    });

    test('function criteria should filter results correctly', () => {
        let results = randomElement(objects, {name: (n) => n.length === 5});

        expect(results).toBe(objects[2]);
        
    });

    test('incorrect criteria should return null', () => {
        let result1 = randomElement(objects, {criteria: 1234});
        let result2 = randomElement(objects, {name: () => false});
        expect(result1).toBeNull();
        expect(result2).toBeNull();
        
    });
})