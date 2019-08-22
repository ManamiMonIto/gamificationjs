### Database | Storage

In the current version a Postgres DB is used, but you're welcome to offer your own solution.

Verify local installation of PortgresDB:

1. Check Postgres version via `postgres -V`.
2. Start Postgres and Redis services on the default ports. You can use `brew services list` to check the status and `brew services start redis`. More info on [official page](https://github.com/Homebrew/homebrew-services).

### Create a ROLE and configure DB

1. `psql postgres`
2. `\du` to check existing user entries
3. `CREATE ROLE gamification WITH LOGIN PASSWORD 'gamification';` to create dedicated user
4. `ALTER ROLE gamification CREATEDB;` to give permission to create DB.
5. `\q` to exit and re-login with new user `psql postgres -U gamification`
6. `CREATE DATABASE gamification`\q
7. `GRANT ALL PRIVILEGES ON DATABASE gamification TO gamification;`. Then check if database was setup correctly: `\list`. If you need to change owner of db: `ALTER DATABASE gamification OWNER TO gamification;`.
8. `\connect gamification;` and finally `\dt` to check the tables. `\q` to exit.

### Seed init data for testing (knexjs)

1. Migrate - `knex migrate:latest --env development`.
2. Seed - `knex seed:run --env development`.

### Start the server

1.  Verify if all packages installed correctly. Use `rm -rf ./node_modules/` to clean the install, then `npm install` and `npm audit fix` if any vulnerabilities found.
2.  Start server - `npm start`.
3.  (not implemented yet) ~Test - `npm test`.~

### Setup notes:

Database migrations build with knexjs should be rollable back and forth w/o problems. If change any data models please make sure that you can effortlessly perform `knex migrate:latest --env development`, `knex migrate:rollback --env development` and seeding data accordingly with `knex seed:run --env development`.

## Theory

Gamification is motivational tool with setting goals and unlocking achievements in comparison to other users. For clarity I will use a taxi mobile app where we should gamify the quality of service as well as number of passengers etc.

- Dimension - is simply something countable (ex.: passengers, parcels)
- Score - is a count (a number) on a given Dimension on timeline (ex.: 6 passengers). It's dependant on timescope.
- Progress - a **point** defining user progress in the multi-dimensional **space** (ex.: 6 passengers and 2 parcels deliverd with 0 damage to a vehicle)
- Goal - is point in the space by achieving which user gets bonus points or/and badge with title (ex.: to pick up 5 passengers and 1 parcel delivered per day would be a simple Goal). Reward, Achievement, Badge, Bonus score - all are defined in the Goal. User gets a reward by his Progress point vector crossing ("stabbing" as imagined in terms of vectors) the flat surface passing through the Goal point and orthogonal to the zero point of the space. In other words, a Goal splits space on two mutually exclusive and collectively exhaustive (MECE principle) half-spaces and all Progress vectors in one half define achieved Goal. (*a supplementary image will be attached for clarification*)
- Level - is a sphere in the space which defines set of Progress vectors crossing it ("stabbing through") which will define achieved Level. (*this definition is not precise since the Goal is assumed to be a multi-dimensional flat surface*)
- ScoreEvent - each new change in any Score on any Dimension(s) is saved separately to track the historical data.
<!-- - TimeBoundedGoal - -->

## Tutorial

1. First define dimensions for the game space. A dimension is for example "number of bananas sold". It's just a dimension across which a user may be able to gain positive or negative score. In math terms it's a dimension of the space.
2. For defined dimension then you have to create sort of milestones, called "Goal". For example two goals could be "Sell 10 bananas" and "Sell 100 bananas". In other words you define a precise point (aka score) on the dimension axis. The Goal then should have a reward in some form of a badge, title, description etc. In given example as soon as a user gains 10 bananas sold - he gets first badge.
3. After a user is registered he gets 0 total score and may start gaining (or loosing) scores. As soon as he gets some points in a single dimension, it will be reflected both in total score and individual score.

### Detailed steps of setting up a new gamespace with goals and rewards

**ACHTUNG!**
Important things to prepare ahead are: 1) create levels then 2) create first dimension `totalScore` then 3) create all following dimensions with correct `external_src` masks included, only then 4) create goals with fixed links on badges.

1. create level(s) - `POST /levels`

**NOTE!**
For consistency with totalScore = 0, have to create a Level 0 with score=0 (could be done with seeding after migrations):

    {
      "value": 0,
      "score": 0,
      "title": "Level 0",
      "badge": "https://octodex.github.com/images/okal-eltocat.jpg",
      "description": "No score"
    }

Required fields:

    value<number> - Level sequential number (Level 1, Level 2...)
    score<number> - totalScore required to gain current Level
    title<string>
    badge<string> - Most often just img src

Optional fields:

    description<string> - defaults to ''


Examples:

    {
      "value": 1,
      "score": 5,
      "title": "Newbie",
      "badge": "https://octodex.github.com/images/inflatocat.png",
      "description": "Only beginning"
    }
    {
      "value": 2,
      "score": 15,
      "title": "Talanted",
      "badge": "https://octodex.github.com/images/gracehoppertocat.jpg",
      "description": "This is not the end"
    }
    {
      "value": 3,
      "score": 25,
      "title": "You're his father",
      "badge": "https://octodex.github.com/images/dojocat.jpg",
      "description": "This is not the end"
    }

2. create users - `POST /users`

**NOTE: First GET /levels to verify ids !**

    Error: ORA-02291: integrity constraint (STG_GAMIFICATION.users_level_id_foreign) violated - parent key not found

happens is due to existance (absence) of Level 0 with score = 0.

    .alterTable('users', function(table) {
      table.integer('level_id').references('levels.id').defaultsTo(1);
    });

Required fields:

    ownerId<number> - The id of a corresponding user model in another service/DB
    firstname<string>
    lastname<string>

Optional fields:

    levelId<number> - if only a user should start NOT from Level 0, defaults to id=1.

**NOTE**
The `ownerId` is an additional field in User model to match users in ~~multiple~~ primary service. The gamification (i.e. "secondary") service will utilize corresponding int value on according data fetching.
In case if it's not needed - just duplicate value of `userId` into `ownerId`.

**IMPORTANT!**
Removed requirement NOT NULL for `user.owner_id`, `dimensions_users.owner_id` and `score_events.owner_id`. This would allow to save new entries without constraints but should be carefully treated - otherwise under risk loosing relations between user entries in different services. OwnerId is also set as TEXT since on current BE possible id of type string and after conversion to int would be out of type INT range, thus have to parse strings.

**TODO**
Implement the multi-services mapping of a single User entity.

Example of creating users payload:

    [
      {
        "ownerId": 1,
        "firstname": "Karel",
        "lastname": "Solo",
        "levelId": 1
      },
      {
        "ownerId": 2,
        "firstname": "Sergey",
        "lastname": "Darklighter"
      },
      {
        "ownerId": 3,
        "firstname": "Robert",
        "lastname": "Skywalker",
        "levelId": 2
      },
      {
        "ownerId": 4,
        "firstname": "Franziska",
        "lastname": "Organa",
      }
    ]

3. create dimension(s) - `POST /dimensions`

Required fields:

    name<string> - the name of the Dimension

Optional fields:

    None

Examples of payload:

    {
      "name": "Spaceships destroyed"
    }
    {
      "name": "Planets conquered"
    }
    {
      "name": "Enemies captured"
    }
    {
      "name": "Droids fixed"
    }

4. create goal(s) - `POST /goals`

Required fields:

    description<string> - how much of which Dimensions should be achieved
    score<string> - Stringified JSON of format "{ <dimension_id>: <score> }"
    dimensions<number[]> - array of ints to which Dimensions the Goal relates

Optional fields:

    reward_badge<string> - usually img src
    reward_title<string> - title assigned under badge
    reward_description<string>
    reward_coins<number> - profit given to a user as soon as achieved goal, defaults to 0. Can be either added to totalScore or to separate coins.


For Oracle DB:

> SELECT COUNT(*) "count" FROM "goals" WHERE "description" = 'Fix 5 droids';
> Error: ORA-00932: inconsistent datatypes: expected - got CLOB

read following: https://stackoverflow.com/a/12980560/1598355.

Payload examples:

    {
      "description": "Capture 21 jedis & Destroy three spaceships",
      "dimensions": [3, 2],
      "score": {"3": "21", "2": "3"},
      "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
      "reward_title": "be the Lucas",
      "reward_description": "Jedi of jedis",
      "reward_coins": 15
    }

    {
      "description": "Conquer 5 planets and destroy 2 spaceships",
      "dimensions": [1, 2],
      "score": {"1": "2", "2": "5"},
      "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
      "reward_title": "be the Lucas",
      "reward_description": "Jedi of jedis"
      "reward_coins": 15
    }

    {
      "description": "Fix 5 droids",
      "dimensions": [1],
      "score": {"1": "5"},
      "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
      "reward_title": "be the Lucas",
      "reward_description": "Jedi of jedis",
    }

If succeeded - `GET /goals` should return following:

    [
      {
          "id": 10,
          "created_at": "2018-07-20T11:40:15.044Z",
          "updated_at": "2018-07-20T11:40:15.044Z",
          "description": "Fix 5 droids",
          "score": {
              "4": "5"
          },
          "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
          "reward_title": "be the Lucas",
          "reward_description": "Jedi of jedis",
          "dimensions": [
              {
                  "id": 4,
                  "created_at": "2018-07-20T07:35:26.641Z",
                  "updated_at": "2018-07-20T07:35:26.641Z",
                  "name": "Droids fixed",
                  "score": "5"
              }
          ]
      }
    ]

Verify that relation to "dimensions" were created correctly.

5. test score update - `PUT /scores/:ownerId`

Required fields:

    dimension_id<number> - may be a str or int with dimension.id on which to increase/decrease score
    score<number> - the exact points to add/subtract

    { <dimension_id>: <score> }

Examples:

    { "4": 1 }

    { "4": 1, "2": 2 }

### How to update by dimension.external_src

How the TEXT field external_src may store path to required data in some form:

    d.external_src === {
      'itemsSold.visual.color': 'WHITE',
      'itemsSold.external.shape': 'sphere'
    }

which transforms into following:

    formData === {
      itemsSold: {
        'visual': {
          'colow': 'WHITE'
        },
        'external': {
          'shape': 'sphere'
        }
      },
    }

So then the structure allows to use mapping of any kind of JSON object passed to special function to get a proper payload for score update.

    const applyDimensionMask = (data, dimensions) => {
      const basket: any = {}

      dimensions.filter(d => {
        const paths = Object.keys(d.external_src)

        /**
        * Check if all required fields match values saved in dimension 'mask'.
        * If length === 0 then all values from mask match required fields and
        * values in the order, then the user should get +1 in progress over
        * matching dimension.
        */
        if (paths.reduce(
          (acc, path) => {
            return get(data, path) === d.external_src[path] ? acc + '' : acc + '1'
          }, ''
        ).length === 0) {
          // 1 equal to default step over Dimension.
          basket[d.id] = 1
        }
      })

      return basket
    }

The only drawback is to use 2 requests instead of single one, but this is logical in case if you want the Gamification Engine to never know what kind of data it works with and be able to retrieve any kind of relations of Dimensions to external sources (like items sold).

    export const updateScoreByOrderData = (ownerId: any, data: any) => axios
      .get('/api/dimensions')
      .then(dimensions => applyDimensionMask(data, dimensions))
      .then(foo => {
        axios.put(`/api/score/${ownerId}`, foo)
          .then(response => response.data)
          .catch(error => { throw Error(error) })
      })
      .catch(error => { throw Error(error) })


1. test progress updated - `GET /achievements/:ownerId` or `GET /progress` or `GET /progress/:ownerId`

Example with `GET /progress/:ownerId`:

    {
      "progress": [
          {
              "updated_at": "2018-07-20T13:08:01.815Z",
              "dimension_id": 1,
              "score": 2,
              "dimension_name": "Spaceships destroyed"
          },
          {
              "updated_at": "2018-07-20T12:48:05.136Z",
              "dimension_id": 4,
              "score": 5,
              "dimension_name": "Droids fixed"
          }
      ],
      "goals": [
          {
              "id": 10,
              "created_at": "2018-07-20T11:40:15.044Z",
              "updated_at": "2018-07-20T11:40:15.044Z",
              "description": "Fix 5 droids",
              "score": {
                  "4": "5"
              },
              "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
              "reward_title": "be the Lucas",
              "reward_description": "Jedi of jedis",
              "reward_coins": 0,
              "completeness": 1
          },
          {
              "id": 11,
              "created_at": "2018-07-20T12:56:29.489Z",
              "updated_at": "2018-07-20T12:56:29.489Z",
              "description": "Conquer 5 planets and destroy 2 spaceships",
              "score": {
                  "1": "2",
                  "2": "5"
              },
              "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
              "reward_title": "be the Lucas",
              "reward_description": "Jedi of jedis",
              "reward_coins": 3,
              "completeness": 0.2857142857142857
          }
      ],
      "totalScore": 7,
      "coins": 3,
      "firstname": "Franziska",
      "lastname": "Organa",
      "achievements": {
          "0": {
              "id": 10,
              "created_at": "2018-07-20T11:40:15.044Z",
              "updated_at": "2018-07-20T11:40:15.044Z",
              "description": "Fix 5 droids",
              "score": {
                  "4": "5"
              },
              "reward_badge": "https://i.pinimg.com/originals/17/30/15/173015e6fbf6ad12893979106862fffc.jpg",
              "reward_title": "be the Lucas",
              "reward_description": "Jedi of jedis"
          }
      },
      "level": {
          "id": 1,
          "created_at": "2018-07-20T07:32:44.795Z",
          "updated_at": "2018-07-20T07:32:44.795Z",
          "value": 1,
          "score": 5,
          "title": "Newbie",
          "badge": "https://octodex.github.com/images/inflatocat.png",
          "description": "Only beginning"
      },
      "nextLevel": {
          "id": 2,
          "created_at": "2018-07-20T07:32:54.321Z",
          "updated_at": "2018-07-20T07:32:54.321Z",
          "value": 2,
          "score": 15,
          "title": "Talanted",
          "badge": "https://octodex.github.com/images/gracehoppertocat.jpg",
          "description": "This is not the end"
      },
      "nextLevelScore": 2,
      "nextLevelProgress": 0.2
    }

Explanation of some response therms:

 - **goals** - are only those which related to the progress.
 - **achievements** - are saved and never deleted unless user deleted (even if related dimensions or goals were removed after the achievement).
 - **level** - is singular and calculated on the totalScore.
 - **nextLevel** - is singular and will be defined after achieved as level.
 - **nextLevelScore** - the amount of score points inside the nextLevel.
 - **nextLevelProgress** - % representation (approximate, formula should be adjusted) of level completeness.
 - **totalScore** - is the SUM of all scores. Might change later. In version 1.0.0 also includes "coins" which are not present in the response.
 - **coins** - are NOT included in response in version 1.0.0. Though should be used separately from score since the score is "measurement of progress" and coins is "reward exchangeable on something else"



7. Finally test ladder ("Rating") updated - `GET ladder/me/:ownerId`

Example of response:

    [
      {
        "user_id": 4,
        "score": 7,
        "firstname": "Franziska",
        "lastname": "Organa",
        "badge": "https://octodex.github.com/images/inflatocat.png"
      }
    ]
