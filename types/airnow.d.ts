/**
 * Forecasted AQI category number.
 */
export enum CategoryNumber {
	Good = 1,
	Moderate,
	UnhealthyForSensitiveGroups,
	Unhealthy,
	VeryUnhealthy,
	Hazardous,
	Unavailable
}

/**
 * @private
 */
interface ForecastInput {
	/**
	 * Date of forecast. If date is omitted, the current forecast is returned.
	 * @example '2012-02-01'
	 */
	date?: string;
	/**
	 * Format of the payload file returned.
	 */
	format: 'text/csv' | 'application/json' | 'application/xml';
	/**
	 * @example 150
	 */
	distance?: number;
	/**
	 * Unique API key, associated with the AirNow user account.
	 */
	// eslint-disable-next-line camelcase
	api_key: string;
}

export interface ForecastInputZipCode extends ForecastInput {
	/**
	 * Zip code.
	 * @example '94954'
	 */
	zipCode: string;
	/**
	 * If no reporting area is associated with the specified Zip Code, return a forecast from a nearby reporting area within this distance (in miles).
	 */
	distance?: number;
}

export interface Forecast {
	/**
	 * Date the forecast was issued.
	 * @example '2012-02-01'
	 */
	DateIssue: string;
	/**
	 * Date for which the forecast applies.
	 * @example '2012-02-02'
	 */
	DateForecast: string;
	/**
	 * Two-character state abbreviation.
	 * @example 'CA'
	 */
	ReportingArea: string;
	/**
	 * Latitude in decimal degrees.
	 * @example 38.33
	 */
	Latitude: number;
	/**
	 * Longitude in decimal degrees.
	 * @example -122.28
	 */
	Longitude: number;
	/**
	 * Forecasted parameter name.
	 * @example 'Ozone'
	 */
	ParameterName: string;
	/**
	 * Numerical AQI value forecasted. When a numerical AQI value is not available, such as when only a categorical forecast has been submitted, a `-1` will be returned.
	 * @example 45
	 */
	AQI: number | -1;

	Category: {
		/**
		 * Forecasted AQI category number.
		 * @see {CategoryNumber} Category number enum
		 */
		Number: CategoryNumber;

		/**
		 * Name of the AQI category.
		 * @example 'Good'
		 */
		Name: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unavailable';
	};
	/**
	 * Action day status (true or false).
	 * @example false
	 */
	ActionDay: boolean;
	/**
	 * Forecast discussion narrative.
	 * @example 'Today, scattered light rain showers and the associated high relative humidity will support particle production, keeping particle levels Moderate.'
	 */
	Discussion?: string;
}
