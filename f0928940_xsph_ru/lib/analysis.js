var epsilon = 1e-8

function derivative(f) {
    var dx = 1e-5
    return x => (f(x+dx)-f(x-dx))/(2*dx)
}

function almostEqual(a,b,eps)
{
    return abs(b - a) < (eps || epsilon)*abs(a + b)
}

function newton(f,df,x0,d)
{
    return fixedPoint(x => x - f(x)/df(x), x0, d || 10 , id, almostEqual)
}

function bisection(f, a, b, cond, eps, d) {
    // total robust root-finder
    var cond = cond || (f => f == 0)
    var eps = eps || epsilon
    function loop(a, b, fa, fb, d) {
	if (!(cond(fa) ^ cond(fb)) || d <= 0) return false
	var c = (a+b)/2, fc = f(c)
	if (almostEqual(a,b))
	    return cond(fa) ?  [b,fb]
	    : cond(fb) ? [a,fa]
	    : [c,fc]
	else
	    return loop(a,c,fa,fc,d-1) || loop(c,b,fc,fb,d-1)
    }
    return loop(a,b,f(a),f(b),d||100)
}

function findRoot(f,x0,cond,eps,d)
{
    // total universal root-finder
    cond = cond || (f => f == 0)
    eps = eps || epsilon
    return search(x0,x0 + 10*eps) || search(x0,x0-10*eps)
    function search(a,b)
    {
	var d = b - a
	return abs(d) <= 1e4 &&
	    (bisection(f,a,b,cond,eps) || search(b,b+2*d))
    }
}

var Integration = {
    xs : [-1/3*Math.sqrt(5 + 2*Math.sqrt(10/7)),
	  -1/3*Math.sqrt(5 - 2*Math.sqrt(10/7)),
	  0,
	  1/3*Math.sqrt(5 - 2*Math.sqrt(10/7)),
	  1/3*Math.sqrt(5 + 2*Math.sqrt(10/7))],
    ws : [(322-13*Math.sqrt(70))/900,
	  (322+13*Math.sqrt(70))/900,
	  128/225,
	  (322+13*Math.sqrt(70))/900,
	  (322-13*Math.sqrt(70))/900]
}

function gaussIntegrate(f,[a,b])
{
    var d = (b - a) / 2, m = (b + a) / 2
    return d*Integration.xs.map(x => f(d*x + m)).dot(Integration.ws)
}

function integrate(f,[a,b],o)
{
    var opts = o || {}
    var d = opts['divisions'] || 1
    var maxd = opts['maxDivisions'] || 10
    var eps = opts['epsilon'] || epsilon

    function go(a,b,d,i0) {
	if (d > maxd) return i0
	var c = (a + b) / 2
	var il = gaussIntegrate(f,[a,c])
	var ir = gaussIntegrate(f,[c,b])
	var i1 = ir + il 
	return almostEqual(i0,i1,eps) ? i1 : go(a,c,d+1,il) + go(c,b,d+1,ir)
    }
    
    return go(a, b, d, gaussIntegrate(f,[a, b]))
}

// a and c define range to search
// func(x) returns value of function at x to be minimized
function goldenSection(f, a, c) {
  function split(x1, x2) { return x1 + 0.6180339887498949*(x2-x1); }
  var b = split(a, c);
  var bv = f(b);
    while (abs(a - c) > epsilon) {
    var x = split(a, b);
    var xv = f(x);
    if (xv < bv) {
      bv = xv;
      c = b;
      b = x;
    }
    else {
      a = c;
      c = x;
    }
  }
  return b;
}

function findMin(f,x,d=10) {
    let dx = sqrt(epsilon)
    let k = 1
    if (f(x) > f (x + dx))
	dx = -dx
    while (k < d) {
	k += 1
    }
}
