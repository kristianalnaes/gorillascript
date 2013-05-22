macro myif
  syntax test as Logic, body as Body, else-body as ("myelse", this as Body)?
    @if(test, body, else-body)

macro myfor
  syntax init as Expression, ";", test as Logic, ";", step as Statement, body as Body
    @for(init, test, step, body)
  
  syntax ident as Identifier, "=", start, ",", end, body as Body
    let init = []
    
    init.push (AST let mutable $ident = $start)
    
    myif @has-func(body)
      let func = @tmp \f
      init.push (AST let $func = #($ident) -> $body)
      body := (AST $func($ident))
    
    AST
      myfor $init; $ident ~< $end; $ident ~+= 1
        $body

macro make-array(thing)
  if not @is-array(thing)
    throw Error "Expected an array"
  let parts = []
  let elements = @elements(thing)
  let len = elements.length
  myfor i = 0, len
    let item = elements[i]
    parts.push AST $item
  
  @array parts

macro square(value)
  let f = @tmp \f
  let tmp = @tmp \ref
  AST do
    let $f()
      $tmp * $tmp
    let $tmp = $value
    $f()

describe "scope of tmp variables", #
  it "should work given differing function scopes", #
    expect(square 0).to.equal 0
    expect(square 5).to.equal 25

macro do-yield(value)
  ASTE yield $value

describe "Macros", #
  it "should allow for indirect yield expresion", #
    let generator()*
      do-yield "hello"
      do-yield "there"
    
    let iter = generator()
    expect(iter.next()).to.eql { -done, value: "hello" }
    expect(iter.next()).to.eql { -done, value: "there" }
