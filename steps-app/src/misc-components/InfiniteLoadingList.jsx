import React from "react";
import InfiniteLoader from "react-virtualized/dist/commonjs/InfiniteLoader";
import List from "react-virtualized/dist/commonjs/List";

export default class InfiniteLoadingList extends React.PureComponent {
	
	constructor(props) {
		super(props);
		this.listRef = React.createRef();
	}
	
	componentWillReceiveProps(){
		this.listRef.current.forceUpdateGrid();
	}
	
	render() {
		const loadedCount = (this.props.hasNextPage && !this.props.isNextPageLoading) ? this.props.loadedItemCount + 1 : this.props.loadedItemCount;
		return (
			<InfiniteLoader
			  isRowLoaded={this.props.isRowLoaded}
			  loadMoreRows={this.props.loadMoreRows}
			  rowCount={loadedCount}>
			  {({onRowsRendered}) => (
					<List
					  ref={this.listRef}
					  height={1000}
					  onRowsRendered={onRowsRendered}
					  rowCount={loadedCount}
					  rowHeight={this.props.height || 200}
					  rowRenderer={this.props.rowRenderer}
					  width={this.props.width || 250}
					  style={{outline: "none"}}
					/>
			  )}
			</InfiniteLoader>
		);
	}
	
}