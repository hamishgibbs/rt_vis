module.exports = function(grunt) {

  grunt.initConfig({
    ts: {
      default: {
        src: ["**/*.ts", "!node_modules/**/*.ts"]
      },
    },
    concat: {
      options: {
        separator: ';',
        sourceMap :true,
      },
      js: {
        src: ['src/js/rt_vis.js', 'src/js/interact.js', 'src/js/setup.js', 'src/js/map.js', 'src/js/ts.js'],
        dest: 'dist/build.js',
      },
      css: {
        src: ['src/css/setup.css', 'src/css/map.css', 'src/css/ts.css'],
        dest: 'dist/styles.css',
      },
    },
    uglify: {
      target: {
        files: {
          'dist/build.min.js': ['dist/build.js']
        },
        css: {
          'dist/styles.min.css': ['dist/styles.css']
        }
      }
    },
    watch: {
    scripts: {
      files: ['src/**/*.ts', 'src/**/*.css'],
      tasks: ['ts', 'concat', 'uglify'],
      options: {
        spawn: true,
        atBegin: true
      },
    },
  }
  });

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask("default", ["ts", "concat", "uglify"]);

};
