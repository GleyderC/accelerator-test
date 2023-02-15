
import axios from "axios";
const dashboardQuery = `
      query Dashboard( $start_date: DateTime, $end_date: DateTime, $aggregation_type: AggregationType, $productType: [String]) {
        dashboard(start_date: $start_date, end_date: $end_date, aggregation: $aggregation_type, product_type: $productType)
      }
`;
const endpoint = `http://localhost:4001/`

describe('resolvers', () => {
  it('should match dashboard calculation for All dressed pizza, aggregated by week for first two weeks of Jan 2022', async () => {
    const graphqlQuery = {
      'operationName': "Dashboard",
      'query': dashboardQuery,
      'variables': {
        'aggregation_type': 'WEEK',
        'start_date': '2022-01-01',
        'end_date': '2022-01-03',
        'productType': ['All Dressed']
      }
    };

    const { data } = await axios({
      url: endpoint,
      method: 'POST',
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify(graphqlQuery)
    });
    expect(data).toEqual({
      "data": {
        "dashboard": {
          "sales": 1995,
          "ingredients_cost": 1854.02,
          "units_sold": 133,
          "ingredients_used": 210,
          "profit": 140.98,
          "aggregation": {
            "2022-1": {
              "sales": 375,
              "ingredients_cost": 348.5,
              "units_sold": 25,
              "ingredients_used": 70,
              "profit": 26.5
            },
            "2022-2": {
              "sales": 1620,
              "ingredients_cost": 1505.52,
              "units_sold": 108,
              "ingredients_used": 140,
              "profit": 114.48
            }
          }
        }
      }
    });
  });
});
