var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var less = require('gulp-less');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

// folders
var folder = {
  src: 'src/',
  dist: 'dist/',
  test: 'test'
};

gulp.task('templates', function () {
    var data = {};

    var options = {
        batch: [folder.src+'templates/partials']
    };

    return gulp.src([folder.src+'templates/**/*.hbs', '!'+folder.src+'templates/partials/**/*.hbs'])
        .pipe(handlebars(data, options))
        .pipe(rename(function (path) {
            path.extname = '.html';
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('images', function () {
    gulp.src([folder.src+'img/**/*'])
        .pipe(imageMin())
        .pipe(gulp.dest(folder.dist+'/img'))
        .pipe(browserSync.stream());
});


gulp.task('scripts', function () {
    var b = browserify({
      entries: folder.src+'scripts/main.js',
      debug: true
    });

    b.bundle()
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(folder.dist+'/scripts/'))
      .pipe(browserSync.stream());
});

gulp.task('styles', function () {
    gulp.src([folder.src+'styles/main.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream());
});

gulp.task('lint', function(){
  gulp.src(folder.src+'scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('unit-test', function(){
  gulp.src(folder.test+'*.js')
    .pipe(mocha());
});

gulp.task('test',['lint', 'unit-test']);

gulp.task('default',['styles', 'scripts', 'templates', 'test'] , function () {
    browserSync.init({
        server: './'
    });

    gulp.watch(folder.src+'styles/**/*.scss', ['styles']);
    gulp.watch(folder.src+'img/**/*', ['images']);
    gulp.watch(folder.src+'scripts/**/*', ['scripts', 'lint', 'unit-test']);
    gulp.watch(folder.src+'templates/**/*.hbs', ['templates']);
    gulp.watch('*.html', browserSync.reload);
});
