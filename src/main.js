var Vue = require('vue');

Vue.use(require('vue-resource'))

var CornerComponenet = Vue.component('corner', {
    template: '#corner-template',

    props: [
        'corner',
        'image',
    ],

    data: function() {
        return {
            count: 0,
            user: {
                id: '',
                avatar: '',
                followers: '',
                login: '',
                name: '',
                repos: [],
                stars: 0,
                total: 0,
            },
            auth: '?client_id=ace1e165828b4adf6528&client_secret=9f26b3f14aa536fed70596cdb8ccb1448014dd17',
        };
    },

    methods: {
        getUser: function() {
            if (this.validations(this)) return;

            this.$http.get('https://api.github.com/users/' + this.user.login + this.auth, function (data, status, request) {
                this.user.avatar    = data.avatar_url;
                this.user.name      = data.name;
                this.user.id        = data.id;
                this.user.followers = data.followers;

                this.getRepos(this.user);
            })
            .error(function (data, status, request) {
                this.error("User doesn't exist");
                this.user.login = ''
            })
        },

        getRepos: function(user) {
            countStars = 0

            this.$http.get('https://api.github.com/users/' + user.login + '/repos' + this.auth, function (data, status, request) {
                repos = data
                    .filter(function(repo) {
                        return repo.fork === false;
                    })
                    .map(function(repo) {
                        countStars += +repo.stargazers_count
                        return {
                            'id': repo.id,
                            'name': repo.name,
                            'description': repo.description,
                            'stars': +repo.stargazers_count,
                            'forks': +repo.forks_count,
                            'language': repo.language,
                            'url': repo.html_url,
                        }
                    });

                user.stars = countStars;
                user.repos = repos;
            })
            .error(function (data, status, request) {
                this.error('Error get repositories');
                return false;
            })
        },

        removeUser: function() {
            this.user.id    = 0;
            this.user.login = '';
        },

        validations: function(that) {
            if (that.user.length == 0) {
                that.error('Please, add user');
                return true;
            }

            if (this.$parent.one.login == this.$parent.two.login) {
                this.error('Please, use different user');
                return true;
            } else if (this.user.login.length == 0) {
                this.error('Please, add user');
                return true;
            }
        },

        error: function(msg) {
            return alert(msg);
        },
    },
});

new Vue({
    el: '#app',

    computed: {
        requiredUsers: function() {
            if (this.one.id && this.two.id) {
                return true;
            }
            return false;
        },
    },

    data: {
        one: '',
        two: '',
        points: {
            stars: 5,
            followers: 2,
        },
        owner: 'marcosrjjunior',
        winner: {
            message: '',
            status: false,
            user: { total: 0 },
        },
    },

    methods: {
        fight: function() {
            $('body').addClass('shake');

            if (this.isOwner()) return this.finish();

            this.calculate();

            this.verifyWinner();

            this.finish();
        },

        isOwner: function() {
            var self = this;

            this.$children.map(function(e) {
                if (e.user.login == self.owner) {
                    self.winner.message = "Doesn't matter " + e.user.login + " is sexier!";
                    self.winner.user = e.user;
                }
            });
        },

        calculate: function() {
            var self = this;

            this.$children.map(function(e) {
                if (e.user.stars > 0) {
                    e.user.total = e.user.stars * self.points.stars
                }
                if (e.user.followers > 0) {
                    e.user.total += e.user.followers * self.points.followers
                }
            });
        },

        verifyWinner: function() {
            var self = this;

            this.$children.map(function(e) {
                if (e.user.total > self.winner.user.total) {
                    self.winner.user = e.user;
                } else if (e.user.total == self.winner.user.total) {
                    self.winner.user = self.shuffle([e.user, self.winner.user])[0];
                }
            });

            return true;
        },

        shuffle: function(o) {
            for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        },

        finish: function() {
            var self = this

            if ( ! self.winner.message) {
                self.winner.message = 'User ' + self.winner.user.login + ' Win! ' + self.winner.user.total + ' Points!'
            }

            setTimeout(function() {
                self.$http.get('http://api.giphy.com/v1/gifs/random?&api_key=dc6zaTOxFJmzC&tag=fight', function (data, status, request) {
                    $('.giphy').append('<img src="'+data.data.image_original_url+'">');
                    $('body').removeClass('shake');
                })

                self.winner.status = true;
            }, 1500);

            $('.fight').remove();
            $('.octicon-x').remove();
        },
    },

    ready: function() {
        this.$set('one', this.$children[0].user);
        this.$set('two', this.$children[1].user);
    }
});
