var context2d = [[CANVAS_VARIABLE]].getContext`2d`;

// Each polygon consists of 4 points and an offset vector.
var polys = [
    [[0.16, -0.3], [0.08, -0.3], [-0.16,  0.3], [-0.08,  0.3], [-0.4,    0.0]],   // F_left
    [[0.16, -0.3], [0.08, -0.3], [-0.16,  0.3], [-0.08,  0.3], [-0.12,   0.0]],   // A_left
    [[0.13,  0.275], [0.05,  0.275], [-0.13, -0.175], [-0.09, -0.275], [0.15,    0.025]], // A_right
    [[0.096, -0.04], [0.064,  0.04], [-0.096,  0.04], [-0.064, -0.04], [-0.176, -0.26]],  // F_top
    [[0.096, -0.04], [0.064,  0.04], [-0.096,  0.04], [-0.064, -0.04], [-0.296,  0.04]],  // F_middle
    [[0.04, -0.04], [0.072,  0.04], [-0.072,  0.04], [-0.04, -0.04], [0.0,     0.04]],  // A_middle
    [[0.1, -0.04], [0.13,  0.04], [-0.1,  0.04], [-0.13, -0.04], [0.21,  -0.26]],  // E_top
    [[0.1, -0.04], [0.13,  0.04], [-0.1,  0.04], [-0.13, -0.04], [0.33,   0.04]],  // E_middle
    [[0.1, -0.04], [0.13,  0.04], [-0.1,  0.04], [-0.13, -0.04], [0.42,   0.26]]   // E_bottom
]

/// Persistent randomness
var randoms = Array.from({length: 10000}, Math.random);

/// Starting timestamp.
var timestamp_start;

// Audio sample counter.
var ctr;

/// Linear interpolation with the param clamped to [0,1] (like GLSL mix + clamp).
function mix(a, b, t)
{
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    return a + (b - a) * Math.pow(t, 2);
}

/// Positive modulo.
/// @param numerator Numerator.
/// @param divisor Divisor, must be > 0.
/// @returns Remainder of division of numerator by divisor, always wrapped to positive.
function pmod(numerator, divisor)
{
    return (numerator < 0) ? divisor - Math.abs(numerator) % divisor : numerator % divisor;
}

function draw()
{
    var timestamp = Date.now() - timestamp_start;
    var t_text_fadeout = (timestamp - 46000) / 7000;

    [[CANVAS_VARIABLE]].width = innerWidth;
    [[CANVAS_VARIABLE]].height = innerHeight;

    // Taustan 'tolpat'.
    for (var ii = 0; ii < 200; ii++)
    {
        context2d.setTransform(innerHeight, 0, 0, innerHeight, 0, 0);
        context2d.fillStyle = 'rgba(60,60,250,' + mix(0.2, 0, (ctr - 25e5) * 2e-6) + ')';
        //context2d.fillStyle = 'rgba(60,60,250,0.2)';
        context2d.beginPath();
        context2d.rect(ii * 0.01, pmod(randoms[ii] * 1.6 + Math.sign(randoms[ii] - 0.5) * timestamp * 0.00006, 1.6) - 0.6, 0.005 + Math.sin(ii * 0.03 - timestamp * (0.002 + mix(0, 0.01, timestamp * 0.00009) - mix(0, 0.01, (timestamp - 11000) * 0.001))) * 0.007 + mix(0, 0.03, t_text_fadeout), 0.6);
        context2d.fill();
    }

    for (var ii = 0; ii < 9; ii++)
    {
        for (var jj = 0; jj < 4; jj++)
        {
            var scale_mul = 1 - 0.05*jj;
            var pts = polys[ii];

            // time variables
            // before -> alpha 0.0 == invisible, after, fade to final form.
            // borrow existing data to avoid having to direct
            var time_after_text = timestamp - 14000 + 10000*pts[4][0];
            var time_after_flash = timestamp - 25500 + 10000*pts[4][0];

            var t_text = time_after_text / 11500;
            //var t_flash = t_text > 1 ? time_after_flash / 6000 : 1.0;

            context2d.setTransform(innerHeight, 0, 0, innerHeight, 0, 0);

            //context2d.fillStyle = 'rgba(125,225,255,' + mix(0.1, 0.0, t_flash) + ')';

            /*context2d.beginPath();
            for(var kk = 0; kk < 4; kk++)
            {
              context2d.rect(0, pts[kk][1]-0.005*jj+0.5+pts[4][1], 10, 0.01*jj);
              context2d.rect(pts[kk][0]-0.005*jj+0.8+pts[4][0], 0, 0.01*jj, 10);
            }
            context2d.fill();*/

            /*for (var kk = 0; kk < 4; kk++)
            {
              var cx = Math.cos(2*Math.PI*randoms[100+jj*kk+kk])*randoms[1000-jj*kk+kk]*mix(0, 1, t_flash);
              var cy = Math.sin(2*Math.PI*randoms[100+jj*kk+kk])*randoms[1000-jj*kk+kk]*mix(0, 1, t_flash);
              context2d.beginPath();
              context2d.arc(cx + pts[kk%4][0] + pts[4][0]+0.8, cy + pts[kk%4][1] + pts[4][0]+0.5, mix(0.05, 0.0, t_flash), 0, 2*Math.PI);
              context2d.fill();
            }*/

            context2d.fillStyle = 'rgba(255,180,0,' + mix(0, 0.4, t_text) * mix(1, 0, t_text_fadeout) + ')';

            // average of the first two vertices = principal axis (centroid is always 0)
            var principal_x = (pts[0][0] + pts[1][0]) / 2, principal_y = (pts[0][1] + pts[1][1]) / 2;
            var principal_l = Math.hypot(principal_x, principal_y);

            // scale_global = uniform scale -> 1; scale_principal is the directional stretch along principal vector
            var scale_global = mix(3, 1, t_text), scale_principal = scale_global * (mix(15/(principal_l*principal_l*principal_l), 1, t_text) - 1);

            context2d.translate(pts[4][0]+0.8, pts[4][1]+0.5);
            context2d.transform((scale_global + scale_principal*principal_x*principal_x)*scale_mul, scale_principal*principal_x*principal_y, scale_principal*principal_x*principal_y, (scale_global + scale_principal*principal_y*principal_y)*scale_mul, 0, 0);

            context2d.beginPath();
            context2d.moveTo(...pts[0]);
            for (var kk = 1; kk < 4; kk++)
            {
                context2d.lineTo(...pts[kk]);
            }
            context2d.closePath();
            context2d.fill();

            context2d.fillStyle = 'rgba(255,255,255,' + mix(0.1, 0, t_text > 1 ? time_after_flash / 300 : 1) + ')';

            context2d.transform(time_after_flash*0.1, 0, 0, time_after_flash*0.1, 0, 0);

            context2d.beginPath();
            context2d.moveTo(...pts[0]);
            for (var kk = 1; kk < 4; kk++)
            {
                context2d.lineTo(...pts[kk]);
            }
            context2d.closePath();
            context2d.fill();
        }
    }

    requestAnimationFrame(draw);
}
/// Audio sample counter
onclick = [[ONCLICK_VARIABLE]] => {
    timestamp_start = Date.now();
    var A = new AudioContext;
    var a = A.createScriptProcessor(4096, onclick = ctr = 0, 1);
    a.connect(A.destination);
    var notes = [
        // c0 c1 g2 c3 d3
        0, 12, 31, 36, 38,
        5, 17, 36, 38, 48,
        -2, 10, 31, 36, 38,
        8, 20, 31, 36, 39
    ];
    a.onaudioprocess = d => {
        var d = d.outputBuffer.getChannelData(0);
        for (var ii = 0; ii < 4096; ctr++, ii++) {
            // morph pad
            for (var jj = 0; jj < 40; jj++) {
                // osc freq with portamento
                A[jj + 40] = mix(
		    (
			0.0007 *
			    (2 ** (notes[(jj >> 3) + (((Math.max(0, ctr - 750000) >> 18) * 5) % 20)] / 12))
		    ) + Math.sin(jj) * 0.000011,
		    A[jj + 40] || 0,
		    0.9999
		);
                // osc state
                A[jj] = (A[jj] || 0) + A[jj + 40];
                A[jj] %= 1;
                d[ii] += (
                    // shape the wave for HP filter like effect
                    A[jj] ** 15 - 0.5
                    // oscillators fade in and out at different times
                ) * Math.sin(Math.max(0, (ctr + (jj >> 3) - (jj >> 3) * 2e5) * 5e-6));
            }
            // melody thing
            d[ii] += ((A[10] * (1.7 * Math.max(0, ctr - 750000) >> 17)) & ((ctr >> 13) & 6)) * 0.4;
	    d[ii] *= mix(0.1, 0, (ctr - 25e5) * 2e-6);
        }
    }
    draw();
}
