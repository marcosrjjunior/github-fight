var Vue = require('vue');

Vue.use(require('vue-resource'))

Vue.component('corner', {
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

            this.$http.get('https://api.github.com/users/' + this.user.login + this.auth).then(function (response) {
                this.user.avatar    = response.data.avatar_url;
                this.user.name      = response.data.name;
                this.user.id        = response.data.id;
                this.user.followers = response.data.followers;

                this.getRepos(this.user);
            }, function (response) {
                this.error("User doesn't exist");
                this.user.login = ''
            });
        },

        getRepos: function(user) {
            countStars = 0

            this.$http.get('https://api.github.com/users/' + user.login + '/repos' + this.auth).then(function (response) {
                var repos = response.data
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
            }, function (response) {
                this.error('Error get repositories');
                return false;
            });
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
            return this.one.id && this.two.id;
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
            this.$children.map(function(e) {
                if (e.user.login == this.owner) {
                    this.winner.message = "Doesn't matter " + e.user.login + " is sexier!";
                    this.winner.user = e.user;
                }
            }.bind(this));
        },

        calculate: function() {
            this.$children.map(function(e) {
                if (e.user.stars > 0) {
                    e.user.total = e.user.stars * this.points.stars
                }
                if (e.user.followers > 0) {
                    e.user.total += e.user.followers * this.points.followers
                }
            }.bind(this));
        },

        verifyWinner: function() {
            this.$children.map(function(e) {
                if (e.user.total > this.winner.user.total) {
                    this.winner.user = e.user;
                } else if (e.user.total == this.winner.user.total) {
                    this.winner.user = this.shuffle([e.user, this.winner.user])[0];
                }
            }.bind(this));

            return true;
        },

        shuffle: function(o) {
            for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        },

        finish: function() {
            if ( ! this.winner.message) {
                this.winner.message = 'User ' + this.winner.user.login + ' Win! ' + this.winner.user.total + ' Points!'
            }

            setTimeout(function() {
                this.$http.get('https://api.giphy.com/v1/gifs/random?&api_key=dc6zaTOxFJmzC&tag=fight').then(function (response) {
                    $('.giphy').append('<img src="'+response.data.data.image_original_url+'">');
                    $('body').removeClass('shake');
                }, function (response) {
                    // error callback
                });

                this.winner.status = true;
            }.bind(this), 1500);

            $('.fight').remove();
            $('.octicon-x').remove();
        },
    },

    ready: function() {
        this.$set('one', this.$refs.one.user);
        this.$set('two', this.$refs.two.user);
    }
});
