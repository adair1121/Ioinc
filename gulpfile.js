var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  common:['./src/common/**/*.js'],
  scripts:['./src/scripts/**/*.js'],
  styles:['./src/styles/**/*.css'],
  views:['./src/views/**/*.html']
};

gulp.task('default', ['sass']);


//================market-dev==========================
gulp.task('market-dev',['views','common','scripts','styles','market-watch']);
gulp.task('common',function(){
    //console.log("common on");
    return gulp.src(paths.common)
        .pipe(concat('common.js'))
        .pipe(gulp.dest('www/scripts'));
});
gulp.task('scripts',function(){
    //console.log("scripts on");
    return gulp.src(paths.scripts)
        .pipe(concat('market.js'))
        .pipe(gulp.dest('www/scripts'));
});
gulp.task('styles',function(){
    //console.log("styles on");
    return gulp.src(paths.styles)
        .pipe(concat('market.css'))
        .pipe(gulp.dest('www/styles'));
});
gulp.task('views',function(){
    //console.log("views on");
    return gulp.src(paths.views)
        .pipe(gulp.dest('www/views'));
});
gulp.task('market-watch',['views','common','scripts','styles'],function(){
    gulp.watch(paths.views,['views']);
    gulp.watch(paths.common,['common']);
    gulp.watch(paths.scripts,['scripts']);
    gulp.watch(paths.styles,['styles']);
});
//==========================================

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', ['sass'], function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
