describe 'option', ->
  base =
    a: 1
    b: 2
    c: 3
  src1 =
    a: 11
    b: 12
  src2 =
    a: 21
    d: 24
  
  it 'one option', ->
    opt = new Veasy.Option base

    expect(opt).have.property 'a', 1
    expect(opt).have.property 'b', 2
    expect(opt).have.property 'c', 3

  it 'two option', ->
    opt = new Veasy.Option base, src1

    expect(opt).have.property 'a', 11
    expect(opt).have.property 'b', 12
    expect(opt).have.property 'c', 3

  it 'more option', ->
    opt = new Veasy.Option base, src1, src2

    expect(opt).have.property 'a', 21
    expect(opt).have.property 'b', 12
    expect(opt).have.property 'c', 3
    expect(opt).have.property 'd', 24

    
