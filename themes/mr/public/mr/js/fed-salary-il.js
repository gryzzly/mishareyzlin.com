// @author Misha Reyzlin <hello@mishareyzlin.com>
// @license http://sam.zoy.org/wtfpl/
!function () {
  // The developers
  var devs = [{
        age : 25,
        sex : 'Male'
      }, {
        age : 29,
        sex : 'Male'
      }, {
        age : 25,
        sex : 'Male'
      }, {
        age : 24,
        sex : 'Female'
      }, {
        age : 28,
        sex : 'Male'
      }, {
        age : 28,
        sex : 'Male'
      }, {
        age : 22,
        sex : 'Male'
      }, {
        age : '-',
        sex : 'Male'
      }, {
        age : 21,
        sex : 'Male'
      }, {
        age : 31,
        sex : 'Male'
      }, {
        age : 29,
        sex : 'Male'
      }, {
        age : 26,
        sex : 'Male'
      }, {
        age : 23,
        sex : 'Male'
      }, {
        age : 30,
        sex : 'Male'
      }, {
        age : 28,
        sex : 'Male'
      }, {
        age : 37,
        sex : 'Male'
      }, {
        age : 30,
        sex : 'Male'
      }, {
        age : 25,
        sex : 'Male'
      }, {
        age : 25,
        sex : 'Male'
      }, {
        age : 24,
        sex : 'Male'
      }, {
        age : 34,
        sex : 'Male'
      }, {
        age : 34,
        sex : 'Male'
      }, {
        age : 30,
        sex : 'Male'
      }, {
        age : 27,
        sex : 'Male'
      }, {
        age : 38,
        sex : 'Male'
      }, {
        age : 26,
        sex : 'Male'
      }, {
        age : 29,
        sex : 'Male'
      }, {
        age : 30,
        sex : 'Female'
      }, {
        age : 39,
        sex : 'Male'
      }, {
        age : 26,
        sex : 'Male'
      }],
      // questions
      questions = [{
        name : "Current Salary, in NIS",
        options : [
          "< ₪ 7000",
          "₪ 7000 – 8000",
          "₪ 9000 – 10000",
          "₪ 10000 – 12000",
          "₪ 12000 – 14000",
          "₪ 14000 – 16000",
          "₪ 16000 – 18000",
          "₪ 18000 – 20000",
          "₪ 20000 – 22000",
          "₪ 22000 – 24000",
          "₪ 24000 – 26000",
          "> ₪ 26000",
          "Not applicable"
        ],
        answers : [ 1, 0, 1, 3, 3, 1, 2, 2, 4, 1, 3, 2, 7 ]
      }, {
        name : "Hourly rate, in USD",
        options : [
          "< $10"          , 
          "$10 - $15"      ,
          "$15 - $20"      ,
          "$20 - $25"      ,
          "$25 - $30"      ,
          "$30 - $35"      ,
          "$35 - $40"      ,
          "$40 - $45"      ,
          "$45 - $50"      ,
          "$50 - $60"      ,
          "$60 - $70"      ,
          "$70 - $80"      ,
          "$80 - $90"      ,
          "$90 - $100"     ,
          "> $100"         ,
          "Not applicable" 
        ],
        answers : [ 0, 0, 0, 0, 1, 2, 3, 1, 4, 4, 0, 2, 1, 0, 2, 10 ]
      }, {
        name : "Years of exprience",
        options : [
          "< 1",
          "1 – 2",
          "2 – 3",
          "3 – 4",
          "4 – 5", 
          " > 5",
          "no answer"
        ],
        answers : [ 0, 0, 2, 7, 5, 15, 1 ]
      }, {
        name : "Level of expertise in JavaScript",
        options : [
          "Beginner",
          "Intermediate",
          "Pro"
        ],
        answers : [ 2, 11, 17 ]
      }];
  
  var $canvas = $('.canvas');
  
  var canvas = d3.select('.canvas'),
      width = $canvas.width(),
      height = $canvas.height();

  canvas = canvas.append('svg:svg').attr('width', width).attr('height', height);

  /* Radial Gradient */
  var gradient = canvas.append("svg:defs")
    .append("svg:radialGradient")
      .attr("id", "gradient")
      .attr("x1", "50%")
      .attr("y1", "50%")
      .attr("x2", "50%")
      .attr("y2", "50%")
      .attr("spreadMethod", "pad");

  gradient.append("svg:stop")
      .attr("offset", "75%")
      .attr("stop-color", "#fff")
      .attr("stop-opacity", 1);

  gradient.append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", "#fff")
      .attr("stop-opacity", 0);
      
  var dropShadow = canvas.select('defs')
    .append('svg:filter')
    .attr('id', 'drop-shadow');
  
  dropShadow
      .append('svg:feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 4);
     
//     feBlend in="SourceGraphic" in2="blur-out" mode="normal"/ 
  // dropShadow
  //   .append('svg;')

  var tooltip = canvas
    .append("svg:g")
    .style("visibility", "hidden")
    .attr(
      'transform', 
      'translate( 0, 0 )'
    );
    
  tooltip
    .append('svg:rect')
    .attr('width', 100)
    .attr('height', 70)
    .attr('rx', 10)
    .attr('ry', 10)
    .style('fill','#333')
    .style('opacity', 0.7);
    
  tooltip
    .append('svg:text')
    .attr('class','age')
    .style( 'fill', '#fff' )
    .attr("text-anchor", "start")
    .attr('dx', 10 )
    .attr('dy', 30 );
  
  tooltip
    .append('svg:text')
    .attr('class', 'sex')
    .style( 'fill', '#fff' )
    .attr("text-anchor", "start")
    .attr('dx', 10 )
    .attr('dy', 50 );
    
  // # Initial Frame
  // create circles symbolizing devs
  var circles;
  
  circles = canvas
            .selectAll('circle')
            .data( devs )
            .enter()
            .insert( 'svg:circle', 'g' )
            .attr('class', 'dev')
            .attr( 'r', 10 )
            .attr(
              "cx", 
              function () {
                return d3.scale.linear().domain([ 0, devs.length ]).rangeRound([ 22, width - 22 ])( ~~( Math.random() * 29 ) );
              }
            )
            .attr( 
              "cy",
              function () {
                return d3.scale.linear().domain([ 0, devs.length ]).rangeRound([ 22, height - 22 ])( ~~( Math.random() * 29 ) );
              }
            )
            .style("fill", function( d ) {
              return d.sex === 'Male' ? '#B6CDF2' : '#F2B6C5';
            })
            .style("opacity", 0.75);

    // cache canvas coordinates
    canvasX = $canvas.offset().left;
    canvasY = $canvas.offset().top;
    canvasCX = canvasX + $canvas.width();
    
    circles
        .on("mouseover", function ( d ) {
          tooltip
            .select('text.age')
            .text( "Age: " + d.age );
          tooltip
            .select('text.sex')
            .text('Sex: ' + d.sex );
          // add box-shadow
          // d3.select( this ).attr('filter', 'url(#drop-shadow)');
          d3.select( this )
            .style('fill', 'url(#gradient)')
            .transition()
            .duration( 250 )
            .attr('r', 11 );
          
          return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function () {
          // tooltip's height is 70
          var tooltipY = d3.event.pageY > canvasY + 70 ? 
                  d3.event.pageY - canvasY - 70 :
                  d3.event.pageY - canvasY;
          // tooltip's width is 100 ( +10 margin )
          var tooltipX = d3.event.pageX < canvasCX - 110 ?
                  d3.event.pageX - canvasX + 10 :
                  d3.event.pageX - canvasX - 110;

          return tooltip
            .attr( 
              "transform", 
              "translate(" + tooltipX + ", " + tooltipY + ")"
            );
        })
        .on("mouseout", function () {
          // remove box-shadow
          // d3.select( this ).attr('filter', null );
          d3.select( this )
            .style("fill", function( d ) {
              return d.sex === 'Male' ? '#B6CDF2' : '#F2B6C5';
            })
            .transition()
            .duration( 250 )
            .attr('r', 10 );

          return tooltip.style("visibility", "hidden");
        });

  // First question
  // draw backgrounds as stripes with different colors *animated
  // reposition circles according to the numbers
  // on hover over the stripe show label saying boldly what answer is that
  var drawFrame = function ( settings ) {
    /* 
    options:
      questionNumber {Number} index is 1-based
      hue {Number} 1..360
      saturation {Number} 1..100
      startLightness {Number} 1..100
      endLightness {Number} 1..100
      textPadding {Number}
    */
    
    // in options, question number's index is 1-based, but it's really 0-based
    settings.questionNumber -= 1;

    d3.event && d3.event.preventDefault();
    
    var opts = questions[ settings.questionNumber ].options,
        answers = questions[ settings.questionNumber ].answers.slice(),
        optsLength = opts.length;
        
    
    var step = ~~( height / optsLength ), 
        // how many developers have chosen the most popular option?
        // we set this as an x-scale factor
        xScale = Math.max.apply( Math, answers );
    
    canvas.selectAll('g.option').remove();
    
    var rects = canvas
      .selectAll( 'g.option' )
      .data( opts )
    .enter()
      .insert( 'svg:g', 'circle' )
      .attr( 'class', 'option' )
      .attr(
        'transform', 
        function ( d, i ) {
          return  "translate( 0," + i * step + " )";
        }
      )
      .style( 'opacity', 0.01 );
      
    rects
      .transition()
      .duration( 1000 )
      .style( 'opacity', 0.95 )

    
    rects
      .append( 'svg:rect' )
      .attr( 'height', step )
      .attr( 'width', width )
      .style(
        "fill", 
        function ( d, i ) {
          var hsl, lightness;
          
          lightness = settings.startLightness + 
                      ( optsLength - i ) * ~~( settings.endLightness / optsLength );

          hsl = 'hsl('
          hsl += settings.hue + ',';
          hsl += settings.saturation + '%,';
          hsl += ( d !== 'Not applicable' ? lightness : lightness - 10 ) + '%';
          hsl += ')';

          return hsl;
        }
      );
      
    rects
      .append( 'svg:text' )
      .style( 'fill', '#fff' )
      .attr("text-anchor", "start")
      .attr('dx', settings.textPadding )
      .attr('dy', step / 2 + 8 )
      .text( function ( d ) { return d; } );
      
    // Animate rectangles
    rects
      .selectAll('rect')
      .transition()
      .duration( 500 )
      .delay( function( d, i ) {
        return i * 200;
      } )
      .style( 'opacity', 0.8 )
    
    // Animate containers too
    d3.select('.canvas')
      .transition()
      .duration( 1000 )
      .style( 'height', step * optsLength + 'px' );

    canvas
      .transition()
      .duration( 1000 )
      .attr( 'height', step * optsLength );

    // move the cirlces according to the amount of answers on each option
    circles
      .transition()
      .duration( 1000 )
      .attr(
        'cy', 
        function ( d, index ) {
          for ( var i = 0; i < answers.length; i += 1 ) {
            if ( answers[ i ] !== 0 ) {
              return d3.scale.linear().domain([ 0, optsLength ]).rangeRound([ 0, step * optsLength ])( i ) + step / 2 ;
            }
          }
        }
      )
      .attr(
        'cx', 
        function ( d, index ) {
          var x = 0;
          
          for ( var i = 0; i < answers.length; i += 1 ) {
            if ( answers[ i ] !== 0 ) {
              x += d3.scale.linear().domain([ 0, xScale ]).rangeRound([ 120, width - 30 ])( answers[ i ] );
              answers[ i ] -= 1;
              return x;
            }
          }
        }
      )
  };
  
  d3.select('.controls').select('.first').on('click', function() {
    drawFrame({
      questionNumber : 1,
      hue : 210,
      saturation : 80,
      startLightness : 30,
      endLightness : 50,
      textPadding : 15
    });
  });
  
  d3.select('.controls').select('.second').on('click', function() {
    drawFrame({
      questionNumber : 2,
      hue : 120,
      saturation : 60,
      startLightness : 30,
      endLightness : 50,
      textPadding : 15
    });
  });
  
  d3.select('.controls').select('.third').on('click', function() {
    drawFrame({
      questionNumber : 3,
      hue : 300,
      saturation : 70,
      startLightness : 30,
      endLightness : 40,
      textPadding : 15
    });
  });
  
  d3.select('.controls').select('.fourth').on('click', function() {
    drawFrame({
      questionNumber : 4,
      hue : 10,
      saturation : 100,
      startLightness : 30,
      endLightness : 35,
      textPadding : 15
    });
  });
  
  // draw first frame initially 
  drawFrame({
    questionNumber : 1,
    hue : 210,
    saturation : 80,
    startLightness : 30,
    endLightness : 50,
    textPadding : 15
  });
  
}();