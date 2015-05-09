// Loads some packeges
var gulp   = require('gulp');
var path   = require('path');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var csso   = require('gulp-csso');
var less   = require('gulp-less');

// Files
var jsFiles = [
  'src/js/plugins.js',
  'src/js/vk_api.js',
  'src/js/*.js'
];

var jsFilesLib = [
  'src/js/common.js',
  'src/js/lib/jquery.js',
  'src/js/lib/*.js'
];

var lessFiles = [
  'src/css/fonts/*.less',
  'src/css/vendor/*.less',
  'src/css/main.less',
  'src/css/*.less'
];

// Lint & Concat & Minify JS
gulp.task('build_js', function(){
  // lint
  gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));

  // assembly
  gulp.src(jsFilesLib.concat(jsFiles))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('static/js'));
});

// Lint & Concat JS
gulp.task('build_js_dev', function(){
  // lint
  gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));

  // assembly
  gulp.src(jsFilesLib.concat(jsFiles))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('static/js'));
});

//  Compile LESS & Concat & Minify CSS
gulp.task('build_less', function () {
  gulp.src(lessFiles)
    .pipe(less())
    .pipe(concat('main.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('static/css'));
});

// Default
gulp.task('build', function(){
  gulp.run('build_js');
  gulp.run('build_less');
});

// Default
gulp.task('default', function(){
  gulp.run('build_js_dev');
  gulp.run('build_less');

  // Watch JS Files
  gulp.watch(["src/js/**/*.js"], function(event){
    gulp.run('build_js_dev');
  });
  // Watch LESS Files
  gulp.watch(["src/css/**/*.less"], function(event){
    gulp.run('build_less');
  });
});