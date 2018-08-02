/*"use strict";*/

var app = new Vue({
  el: '#app',
  data: {
    message: 'Привет, Vue!',
    name:'',
    cats:[],
    newCat:null
  },
  mounted() {
    if(localStorage.name) {
        this.name = localStorage.name; 
    }
    if(localStorage.getItem('cats')) {
      try {
        this.cats = JSON.parse(localStorage.getItem('cats'));
      } catch(e) {
        localStorage.removeItem('cats');
      }
    }
  },
  watch: {
    name(newName) {
      localStorage.name = newName;
    }
  },
  methods: {
    addCat() {
      // ensure they actually typed something
      if(!this.newCat) return;
      this.cats.push(this.newCat);
      this.newCat = '';
      this.saveCats();
    },
    removeCat(x) {
      this.cats.splice(x,1);
      this.saveCats();
    },
    saveCats() {
      let parsed = JSON.stringify(this.cats);
      localStorage.setItem('cats', parsed);
    }
  }
});

