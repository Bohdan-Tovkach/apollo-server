const { ApolloServer, gql } = require('apollo-server')

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`

  type geoData {
		language: String
    ip: String
    city: String
		countryCode: String
		countryName: String
		continentCode: String
		continentName: String
		postCode: String
		latitude: String
		longitude: String
  }
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. 
  type Query {
    # postIP: [geoData]
		postIP(ip: String!, lang: String!):[geoData]
  }
	
	schema {
		query: Query
	}
`

const resolvers = {
  Query: {
    postIP: (parent, {ip, lang}, context) => {
			// https://ipstack.com/dashboard
			apiKey = '8d79df654365e2f23c619410d981eba6'
			return context.dataSources.apiFunc.getIP(ip, apiKey, lang)
		},
  },
}

const { RESTDataSource } = require('apollo-datasource-rest');

class apiFunc extends RESTDataSource {
  constructor() {
    super()
  }
  async getIP(ip, apiKey, lang) {
		return this.get(`http://api.ipstack.com/${ip}?access_key=${apiKey}&language=${lang}`)
			.then(val => {
				console.log(val)
				console.log(lang)
				return [{
					language: lang,
					ip: val.ip, 
					countryCode: val.country_code,
					countryName: val.country_name,
					continentCode: val.continent_code,
					continentName: val.continent_name,
					city: val.city,
					postCode: val.zip,
					latitude: val.latitude,
					longitude: val.longitude
				}]
			})
  }
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ 
	typeDefs, 
	resolvers,
	dataSources: () => {
    return {
      apiFunc: new apiFunc(),
    }
  },
  context: () => {
    return {
      // token: '###',
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});