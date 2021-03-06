// Tests to see what validity checks are done for 10gen specific object construction

function clientEvalConstructorTest (constructorList) {
    var i;
    constructorList.valid.forEach(function (constructor) {
        assert(eval(constructor));
    });
    constructorList.invalid.forEach(function (constructor) {
        assert.throws(function () { eval(constructor) });
    });
}

function dbEvalConstructorTest (constructorList) {
    var i;
    constructorList.valid.forEach(function (constructor) {
        assert(db.eval(constructor));
    });
    constructorList.invalid.forEach(function (constructor) {
        assert.throws(function () { db.eval(constructor) });
    });
}

function mapReduceConstructorTest (constructorList) {
    t = db.mr_constructors;
    t.drop();

    t.save( { "partner" : 1, "visits" : 9 } )
    t.save( { "partner" : 2, "visits" : 9 } )
    t.save( { "partner" : 1, "visits" : 11 } )
    t.save( { "partner" : 1, "visits" : 30 } )
    t.save( { "partner" : 2, "visits" : 41 } )
    t.save( { "partner" : 2, "visits" : 41 } )

    constructorList.valid.forEach(function (constructor) {
        m = eval("dummy = function(){ emit( \"test\" , " + constructor + " ) }");

        r = eval("dummy = function( k , v ){ return { test : " + constructor + " } }");

        res = t.mapReduce( m , r , { out : "mr_constructors_out" , scope : { xx : 1 } } );
    });
    constructorList.invalid.forEach(function (constructor) {
        m = eval("dummy = function(){ emit( \"test\" , " + constructor + " ) }");

        r = eval("dummy = function( k , v ){ return { test : " + constructor + " } }");

        assert.throws(function () { res = t.mapReduce( m , r ,
                                    { out : "mr_constructors_out" , scope : { xx : 1 } } ) });
    });

    db.mr_constructors_out.drop();
    t.drop();
}

function whereConstructorTest (constructorList) {
    t = db.where_constructors;
    t.drop();
    t.insert({ x : 1 });

    constructorList.valid.forEach(function (constructor) {
        t.findOne({ $where : constructor });
    });
    constructorList.invalid.forEach(function (constructor) {
        assert.throws(function () { t.findOne({ $where : constructor }) });
    });
}

var dbrefConstructors = {
    "valid" : [
            "DBRef(\"namespace\", 0)",
            "DBRef(\"namespace\", \"test\")",
            "DBRef(\"namespace\", ObjectId())",
            "DBRef(\"namespace\", ObjectId(\"000000000000000000000000\"))",
            "DBRef(true, ObjectId())"
        ],
    "invalid" : [
            // XXX: this is allowed in v8 but not in spidermonkey
            // "DBRef()",
            "DBRef(\"namespace\")",
            "DBRef(\"namespace\", ObjectId(), true)"
        ]
}

var dbpointerConstructors = {
    "valid" : [
            // XXX: these are allowed in v8 but not in spidermonkey
            //"DBPointer(\"namespace\", 0)",
            //"DBPointer(\"namespace\", \"test\")",
            "DBPointer(\"namespace\", ObjectId())",
            "DBPointer(\"namespace\", ObjectId(\"000000000000000000000000\"))",
            "DBPointer(true, ObjectId())"
        ],
    "invalid" : [
            "DBPointer()",
            "DBPointer(\"namespace\")",
            "DBPointer(\"namespace\", ObjectId(), true)"
        ]
}


var objectidConstructors = {
    "valid" : [
        'ObjectId()',
        'ObjectId("FFFFFFFFFFFFFFFFFFFFFFFF")',
        'new ObjectId()',
        'new ObjectId("FFFFFFFFFFFFFFFFFFFFFFFF")'
        ],
    "invalid" : [
        'ObjectId(5)',
        'ObjectId("FFFFFFFFFFFFFFFFFFFFFFFQ")',
        'new ObjectId(5)',
        'new ObjectId("FFFFFFFFFFFFFFFFFFFFFFFQ")'
        ]
}

var timestampConstructors = {
    "valid" : [
        'Timestamp()',
        'Timestamp(0,0)',
        'Timestamp("test","test")',
        'new Timestamp()',
        'new Timestamp(0,0)'
        ],
    "invalid" : [
        'Timestamp(0)',
        'Timestamp(0,0,0)',
        'new Timestamp(0)',
        'new Timestamp(0,0,0)'
        ]
}

var bindataConstructors = {
    "valid" : [
        'BinData(0,"test")',
        'BinData()',
        'new BinData(0,"test")',
        'new BinData()'
        ],
    "invalid" : [
        'BinData(0,"test", "test")',
        'new BinData(0,"test", "test")'
        ]
}

var dateConstructors = {
    "valid" : [
        'Date()',
        'Date(0)',
        'Date(0,0)',
        'Date(0,0,0)',
        'Date("foo")',
        'new Date()',
        'new Date(0)',
        'new Date(0,0)',
        'new Date(0,0,0)',
        'new Date(0,0,0,0)',
        'new Date("foo")'
        ],
    "invalid" : [
        ]
}

clientEvalConstructorTest(dbrefConstructors);
clientEvalConstructorTest(dbpointerConstructors);
clientEvalConstructorTest(objectidConstructors);
clientEvalConstructorTest(timestampConstructors);
clientEvalConstructorTest(bindataConstructors);
clientEvalConstructorTest(dateConstructors);

dbEvalConstructorTest(dbrefConstructors);
dbEvalConstructorTest(dbpointerConstructors);
dbEvalConstructorTest(objectidConstructors);
dbEvalConstructorTest(timestampConstructors);
dbEvalConstructorTest(bindataConstructors);
dbEvalConstructorTest(dateConstructors);

mapReduceConstructorTest(dbrefConstructors);
mapReduceConstructorTest(dbpointerConstructors);
mapReduceConstructorTest(objectidConstructors);
mapReduceConstructorTest(timestampConstructors);
mapReduceConstructorTest(bindataConstructors);
mapReduceConstructorTest(dateConstructors);

whereConstructorTest(dbrefConstructors);
whereConstructorTest(dbpointerConstructors);
whereConstructorTest(objectidConstructors);
whereConstructorTest(timestampConstructors);
whereConstructorTest(bindataConstructors);
whereConstructorTest(dateConstructors);
