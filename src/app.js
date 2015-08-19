// ADD favicon

new Vue({
    el: '#app',
    data: {
        users : {
            one: {
                id: '',
                nickname: '',
                name: '',
                avatar: '',
                repos: {},
                stars: '',
                countStars: 0,
                followers: 0,
                total: 0,
            },
            two: {
                id: '',
                nickname: '',
                name: '',
                avatar: '',
                repos: {},
                countStars: 0,
                followers: 0,
                total: 0,
            },
        },
        owner: 'marcosrjjunior',
        repos: [],
        error: null,
        submitted: {
            one: false,
            two: false,
        },
        points: {
            stars: 5,
            followers: 2,
        },
        userWin: {
            nickname: '',
            message: '',
            total: '',
        },
        ok: false,
        auth: '?client_id=ace1e165828b4adf6528&client_secret=9f26b3f14aa536fed70596cdb8ccb1448014dd17',
    },

    computed: {
        requiredOne: function() {
            if ( ! this.users.one.nickname) return true;
            return false;
        },
        requiredTwo: function() {
            if ( ! this.users.two.nickname) return true;
            return false;
        },
        requiredUsers: function() {
            if (this.users.one.id != 0 && this.users.two.id != 0) return false;
            return true;
        },
    },

    methods: {
        fight: function(e) {
            $('body').addClass('shake');

            if (this.isOwner()) return this.finish();

            this.calculate();

            this.verifyWinner();

            this.finish();
        },

        verifyWinner: function() {
            if (this.users.one.total > this.users.two.total)
            {
                this.userWin.nickname = '@'+this.users.one.nickname
                this.userWin.total = this.users.one.total
            }
            else if (this.users.one.total == this.users.two.total)
            {
                var user = ['one', 'two'].sort()[0]

                this.userWin.nickname = this.users[user].nickname;
                this.userWin.total = this.users[user].total
            }
            else
            {
                this.userWin.nickname = '@'+this.users.two.nickname
                this.userWin.total = this.users.two.total
            }
            return true;
        },

        calculate: function() {
            for (var user in this.users) {
                if (this.users[user].countStars > 0)
                {
                    this.users[user].total = this.users[user].countStars * this.points.stars
                }
                if (this.users[user].followers > 0)
                {
                    this.users[user].total += this.users[user].followers * this.points.followers
                }
            }
        },

        isOwner: function() {
            if (this.users.one.nickname == this.owner || this.users.two.nickname == this.owner)
            {
                this.userWin.nickname = '@'+this.owner
                this.userWin.message = "Doesn't matter " + this.owner + " is sexier!"
                return true;
            }
        },

        finish: function() {
            var self = this

            if ( ! this.userWin.message)
            {
                this.userWin.message = 'User ' + this.userWin.nickname + ' Win! ' + this.userWin.total + ' Points !'
            }

            setTimeout(function() {
                self.$http.get('http://api.giphy.com/v1/gifs/random?&api_key=dc6zaTOxFJmzC&tag=fight', function (data, status, request) {
                    $('.giphy').append('<img src="'+data.data.image_original_url+'">');
                    $('body').removeClass('shake')
                })

                self.ok = true
            }, 1500);

            $('.fight').remove();
            $('.octicon-x').remove();
        },

        removeUser: function(user) {
            this.submitted[user] = false;
            this.users[user].id = 0;
        },

        getUser: function(user) {

            if (this.validations(user)) return;

            this.$http.get('https://api.github.com/users/' + this.users[user].nickname + this.auth, function (data, status, request) {
                this.users[user].avatar    = data.avatar_url;
                this.users[user].name      = data.name;
                this.users[user].id        = data.id;
                this.users[user].followers = data.followers;
                (user == 'one') ? this.submitted.one = true : this.submitted.two = true;

                this.getRepos(user);
            })
            .error(function (data, status, request) {
                this.error("User doesn't exist");
                this.users[user].nickname = ''
            })
        },

        getRepos: function(user) {
            countStars = 0

            this.$http.get('https://api.github.com/users/' + this.users[user].nickname + '/repos' + this.auth, function (data, status, request) {
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

                    this.users[user].countStars = countStars;
                    this.users[user].repos = repos;
            })
            .error(function (data, status, request) {
                this.error('Error get repositories');
                return false;
            })
        },

        validations: function(user) {
            if (this.users.one.nickname == this.users.two.nickname)
            {
                this.error('Please, use different user');
                return true;
            }

            else if (this.users[user].nickname.length == 0)
            {
                this.error('Please, add user');
                return true;
            }
        },

        error: function(msg) {
            return alert(msg);
        },
    }

});
