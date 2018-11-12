import React from "react";
import Reflux from "reflux";

import SearchIcon from '@material-ui/icons/Search';
import Select, { components } from 'react-select';

import MapStore from "../map/MapStore";
import MapActions from "../map/MapActions";

const DropdownIndicator = (props) => {
	return components.DropdownIndicator && (
    <components.DropdownIndicator {...props}>
		<SearchIcon />
    </components.DropdownIndicator>
  );
};

/**
 * This component renders the search bar at the top of the page
 */
export default class SearchBarComponent extends Reflux.Component {

	constructor(props) {
		super(props);
		this.store = MapStore;
		this.state = {
			selectedAddress: ""
		};
	}

	_handleSelectAddress = (e) => {
		if (e.value) {
			this.setState({
				selectedAddress: e.value.address
			});
			MapActions.selectSidewalk(e.value);
		}
	};
	
	render() {
		if (!this.state.searchVisible) {
			return null;
		}

		const options = this.state.sidewalks.map((sidewalk) => {
			return {
				value: sidewalk,
				label: sidewalk.address
			};
		});
		
		return (
			<div className="searchBar">
				<Select
					value={this.state.selectedAddress}
					onChange={this._handleSelectAddress}
					options={options}
					isSearchable
					placeholder={<div>Search...</div>}
					className="selectText"
					components={{DropdownIndicator}}
				  />
			</div>
		);
	}
}
