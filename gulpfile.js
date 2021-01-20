var gulp = require("gulp"),
    sass = require("gulp-sass"), //переводит SASS в CSS и компилирует
    concat = require("gulp-concat"), //объединение файлов - конкатенация
    watch = require("gulp-watch"), //обновление файлов в режиме реального времени
    pug = require("gulp-pug"), //упрощенная верстка, переводит из Pug в HTML
    pugbem = require("gulp-pugbem"),
    prefixer = require("gulp-autoprefixer"), //добавляет кроссбраузерные префиксы
    imagemin = require("gulp-imagemin"), //оптимизация графики
    imageminJpegRecompress = require("imagemin-jpeg-recompress"),
    pngquant = require("imagemin-pngquant"),
    cssmin = require("gulp-cssmin"), //мифинификация css
    rename = require("gulp-rename"); //переименование файлов

let uglify = require("gulp-uglify-es").default;

var browserSync = require("browser-sync").create(); //производит автообновление страницы

//Объединение, компиляция Scss в CSS, простановка венд. префиксов и дальнейшая минимизация кода
gulp.task("sass", function (param) {
    return gulp
        .src("src/**/*.scss")
        .pipe(sass())
        .pipe(concat("styles.css"))
        .pipe(prefixer(["last 2 versions"], { cascade: false }))
        .pipe(gulp.dest("public/css"))
        .pipe(cssmin())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("public/css"))
        .pipe(browserSync.stream());
    param();
});

//pug
gulp.task("pug", function (param) {
    return gulp
        .src("src/*.pug")
        .pipe(
            pug({
                plugins: [pugbem],
                pretty: true,
            })
        )
        .on("error", function (err) {
            console.log(err);
            this.emit("end");
        })
        .pipe(
            rename(function (path) {
                path.extname = ".html";
            })
        )
        .pipe(gulp.dest("public"))
        .pipe(
            browserSync.reload({
                stream: true,
            })
        );
    param();
});

//scripts
gulp.task("uglify", function () {
    return gulp.src("src/js/*.js").pipe(uglify()).pipe(gulp.dest("public/js"));
});

//image
gulp.task("images", function (param) {
    return gulp
        .src("src/img/**/*.{jpg,png,jpeg,svg}")
        .pipe(
            imagemin(
                [
                    imagemin.gifsicle({ interlaced: true }),
                    imagemin.mozjpeg({ progressive: true }),
                    imageminJpegRecompress({
                        progressive: true,
                        loops: 5,
                        min: 70,
                        max: 85,
                        quality: "medium",
                    }),
                    imagemin.optipng({ optimizationLevel: 3 }),
                    pngquant({ quality: [0.7, 0.85], speed: 5 }),
                ],
                {
                    verbose: true,
                }
            )
        )
        .pipe(gulp.dest("public/img"))
        .pipe(browserSync.reload({ stream: true }));
    param();
});

//Автообновление страницы
gulp.task("browser-sync", function (param) {
    var files = ["*.html", "css//*.css", "js//*.js", "src/**/*.scss"];

    browserSync.init(files, {
        server: {
            baseDir: "public/"
        }
        // proxy: "localhost/",
    });
    param();
});

//Обновление файлов в режиме реального времени
gulp.task("watch", function (param) {
    gulp.watch("src/**/*.scss", gulp.series("sass"));
    // gulp.watch("src/**/*.pug", gulp.series("pug"));
    gulp.watch("src/js/*.js", gulp.series("uglify"));
    gulp.watch("src/images/**/*", gulp.series("images"));
    gulp.watch("public/**/*.html").on("change", browserSync.reload);
    param();
});

//Это таск по умолчанию. Запускает одновременно все перечисленные в нем таски.
gulp.task("default", gulp.series("watch", "browser-sync", "sass", "uglify"));
