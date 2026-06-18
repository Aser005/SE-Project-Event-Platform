var express = require('express');
var router = express.Router();
const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const destinations = {
    paris: {
        name: 'Paris',
        category: 'Cities',
        image: '/paris.png',
        video: 'https://www.youtube.com/embed/UfEiKK-iX70',
        description: 'It is known as the most romantic city in the world, and is home to some world famous sights that are constantly shown in travel magazines, movies, and other works of art. Paris, the capital of France, has a population of over two million people and is one of Europe\'s most-visited cities.'
    },
    rome: {
        name: 'Rome',
        category: 'Cities',
        image: '/rome.png',
        video: 'https://www.youtube.com/embed/oSexfR0Ubzw',
        description: 'Rome today is one of the most important tourist destinations of the world, due to the incalculable immensity of its archaeological and art treasures, as well as for the charm of its unique traditions, the beauty of its panoramic views, and the majesty of its magnificent villas.'
    },
    bali: {
        name: 'Bali Island',
        category: 'Islands',
        image: '/bali.png',
        video: 'https://www.youtube.com/embed/BFS9n4B_2xA',
        description: 'Also known as the Land of the Gods, Bali appeals through its sheer natural beauty of looming volcanoes and lush terraced rice fields that exude peace and serenity. It is also famous for surfers\' paradise.'
    },
    santorini: {
        name: 'Santorini Island',
        category: 'Islands',
        image: '/santorini.png',
        video: 'https://www.youtube.com/embed/cKedc8trR2Y',
        description: 'With its stunning turquoise waters and picturesque villages, great activities including wine-tasting, authentic Greek cuisine, regular boat excursions due to its ideal location for island hopping, small Greek island of Santorini became so popular as a holiday destination.'
    },
    inca: {
        name: 'Inca Trail to Machu Picchu',
        category: 'Hiking',
        image: '/inca.png',
        video: 'https://www.youtube.com/embed/Zk9J5xnTVMA',
        description: 'The Inca Trail to Machu Picchu is one of the world\'s most famous trekking routes. This ancient path winds through stunning Andean landscapes, cloud forests, and Incan ruins, culminating at the breathtaking Machu Picchu citadel. The 4-day journey offers an unforgettable adventure through Peru\'s rich history and natural beauty.'
    },
    annapurna: {
        name: 'Annapurna Circuit',
        category: 'Hiking',
        image: '/annapurna.png',
        video: 'https://www.youtube.com/embed/mfQ31ybmPuA',
        description: 'The Annapurna Circuit in Nepal is one of the most spectacular trekking routes in the Himalayas. This challenging 12-21 day journey takes you through diverse landscapes, from subtropical forests to high-altitude deserts, with stunning views of snow-capped peaks including Annapurna I, the 10th highest mountain in the world.'
    }
};

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

async function checkIfInWantToGo(userId, destinationName) {
    try {
        const db = getDB();
        const users = db.collection('myCollection');
        const user = await users.findOne({ _id: new ObjectId(userId) });
        return user && user.wantToGo && user.wantToGo.includes(destinationName);
    } catch (error) {
        console.error('Error checking want-to-go:', error);
        return false;
    }
}

router.get('/', function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.redirect('/home');
    }
});

router.get('/login', function(req, res, next) {
    if (req.session.user) {
        return res.redirect('/home');
    }
    const successMessage = req.query.registered === 'success' ? 'Registration successful! Please login.' : null;
    res.render('login', { title: 'Login', error: null, success: successMessage || null });
});

router.post('/login', async function(req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render('login', { title: 'Login', error: 'Please enter both username and password', success: null });
        }

        const db = getDB();
        const users = db.collection('myCollection');
        // Case-insensitive username search
        const user = await users.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') },
            password: password 
        });

        if (user) {
            req.session.user = { username: user.username, _id: user._id.toString() };
            res.redirect('/home');
        } else {
            res.render('login', { title: 'Login', error: 'Invalid username or password', success: null });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { title: 'Login', error: 'An error occurred. Please try again.', success: null });
    }
});

router.get('/registration', function(req, res, next) {
    if (req.session.user) {
        return res.redirect('/home');
    }
    res.render('registration', { title: 'Registration', error: null });
});

router.post('/register', async function(req, res, next) {
    try {
        const { username, password } = req.body;
        
        const db = getDB();
        const users = db.collection('myCollection');
        
        if (!username || !password) {
            return res.render('registration', { title: 'Registration', error: 'Invalid registration. Please ensure all fields are filled and the username is available.' });
        }
        
        // Case-insensitive username check
        const existingUser = await users.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        });
        if (existingUser) {
            return res.render('registration', { title: 'Registration', error: 'Invalid registration. Please ensure all fields are filled and the username is available.' });
        }

        // Store username as provided by user (case-insensitive matching handles duplicates)
        const result = await users.insertOne({
            username: username,
            password: password,
            wantToGo: []
        });

        res.redirect('/login?registered=success');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('registration', { title: 'Registration', error: 'An error occurred. Please try again.' });
    }
});

router.get('/logout', function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

router.get('/home', requireAuth, function(req, res, next) {
    res.render('home', { title: 'Destinations', user: req.session.user });
});

router.get('/hiking', requireAuth, function(req, res, next) {
    res.render('hiking', { title: 'Hiking', user: req.session.user });
});

router.get('/cities', requireAuth, function(req, res, next) {
    res.render('cities', { title: 'Cities', user: req.session.user });
});

router.get('/islands', requireAuth, function(req, res, next) {
    res.render('islands', { title: 'Islands', user: req.session.user });
});

router.get('/paris', requireAuth, async function(req, res, next) {
    const dest = destinations.paris;
    const isInList = await checkIfInWantToGo(req.session.user._id, dest.name);
    res.render('paris', { 
        title: dest.name, 
        destination: dest,
        user: req.session.user,
        isInWantToGo: isInList
    });
});

router.get('/rome', requireAuth, async function(req, res, next) {
    const dest = destinations.rome;
    const isInList = await checkIfInWantToGo(req.session.user._id, dest.name);
    res.render('rome', { 
        title: dest.name, 
        destination: dest,
        user: req.session.user,
        isInWantToGo: isInList
    });
});

router.get('/bali', requireAuth, async function(req, res, next) {
    const dest = destinations.bali;
    const isInList = await checkIfInWantToGo(req.session.user._id, dest.name);
    res.render('bali', { 
        title: dest.name, 
        destination: dest,
        user: req.session.user,
        isInWantToGo: isInList
    });
});

router.get('/santorini', requireAuth, async function(req, res, next) {
    const dest = destinations.santorini;
    const isInList = await checkIfInWantToGo(req.session.user._id, dest.name);
    res.render('santorini', { 
        title: dest.name, 
        destination: dest,
        user: req.session.user,
        isInWantToGo: isInList
    });
});

router.get('/inca', requireAuth, async function(req, res, next) {
    const dest = destinations.inca;
    const isInList = await checkIfInWantToGo(req.session.user._id, dest.name);
    res.render('inca', { 
        title: dest.name, 
        destination: dest,
        user: req.session.user,
        isInWantToGo: isInList
    });
});

router.get('/annapurna', requireAuth, async function(req, res, next) {
    const dest = destinations.annapurna;
    const isInList = await checkIfInWantToGo(req.session.user._id, dest.name);
    res.render('annapurna', { 
        title: dest.name, 
        destination: dest,
        user: req.session.user,
        isInWantToGo: isInList
    });
});

router.get('/api/search', requireAuth, function(req, res, next) {
    try {
        const searchTerm = req.query.q ? req.query.q.toLowerCase() : '';
        if (!searchTerm) {
            return res.json([]);
        }

        const results = Object.values(destinations)
            .filter(dest => dest.name.toLowerCase().includes(searchTerm))
            .map(dest => {
                // Get the URL for each destination
                let url = '';
                if (dest.name === 'Paris') url = '/paris';
                else if (dest.name === 'Rome') url = '/rome';
                else if (dest.name === 'Bali Island') url = '/bali';
                else if (dest.name === 'Santorini Island') url = '/santorini';
                else if (dest.name === 'Inca Trail to Machu Picchu') url = '/inca';
                else if (dest.name === 'Annapurna Circuit') url = '/annapurna';
                
                return {
                    name: dest.name,
                    category: dest.category,
                    url: url,
                    image: dest.image
                };
            });

        res.json(results);
    } catch (error) {
        console.error('Autocomplete search error:', error);
        res.json([]);
    }
});

router.post('/search', requireAuth, async function(req, res, next) {
    try {
        const searchTerm = req.body.Search ? req.body.Search.toLowerCase() : '';
        if (!searchTerm) {
            return res.render('searchresults', { 
                title: 'Search Results', 
                results: [],
                searchTerm: '',
                user: req.session.user 
            });
        }

        const results = Object.values(destinations).filter(dest => 
            dest.name.toLowerCase().includes(searchTerm)
        );

        res.render('searchresults', { 
            title: 'Search Results', 
            results: results,
            searchTerm: req.body.Search,
            user: req.session.user 
        });
    } catch (error) {
        console.error('Search error:', error);
        res.render('searchresults', { 
            title: 'Search Results', 
            results: [],
            searchTerm: req.body.Search || '',
            user: req.session.user 
        });
    }
});

router.get('/wanttogo', requireAuth, async function(req, res, next) {
    try {
        const db = getDB();
        const users = db.collection('myCollection');
        const user = await users.findOne({ _id: new ObjectId(req.session.user._id) });
        
        const wantToGoList = user && user.wantToGo ? user.wantToGo : [];
        
        const fullList = wantToGoList.map(destName => {
            const key = Object.keys(destinations).find(k => 
                destinations[k].name.toLowerCase() === destName.toLowerCase()
            );
            return key ? destinations[key] : null;
        }).filter(Boolean);

        res.render('wanttogo', { 
            title: 'Want-to-Go List', 
            wantToGoList: fullList,
            user: req.session.user 
        });
    } catch (error) {
        console.error('Want-to-go list error:', error);
        res.render('wanttogo', { 
            title: 'Want-to-Go List', 
            wantToGoList: [],
            user: req.session.user 
        });
    }
});

router.post('/addtowanttogo', requireAuth, async function(req, res, next) {
    try {
        const { destination } = req.body;
        if (!destination) {
            return res.json({ success: false, message: 'Destination name required' });
        }

        const db = getDB();
        const users = db.collection('myCollection');
        const userId = new ObjectId(req.session.user._id);
        
        const user = await users.findOne({ _id: userId });
        const wantToGo = user && user.wantToGo ? user.wantToGo : [];
        
        if (wantToGo.includes(destination)) {
            return res.json({ success: false, message: 'This destination is already in your want-to-go list' });
        }
        
        await users.updateOne(
            { _id: userId },
            { $push: { wantToGo: destination } }
        );

        res.json({ success: true, message: 'Destination added to your list' });
    } catch (error) {
        console.error('Add to want-to-go error:', error);
        res.json({ success: false, message: 'Error adding destination' });
    }
});

router.post('/removefromwanttogo', requireAuth, async function(req, res, next) {
    try {
        const { destination } = req.body;
        if (!destination) {
            return res.json({ success: false, message: 'Destination name required' });
        }

        const db = getDB();
        const users = db.collection('myCollection');
        const userId = new ObjectId(req.session.user._id);
        
        await users.updateOne(
            { _id: userId },
            { $pull: { wantToGo: destination } }
        );

        res.json({ success: true, message: 'Destination removed from your list' });
    } catch (error) {
        console.error('Remove from want-to-go error:', error);
        res.json({ success: false, message: 'Error removing destination' });
    }
});

module.exports = router;
