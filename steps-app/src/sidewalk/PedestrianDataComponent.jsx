import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import { FONT_FAMILY } from "../constants/ThemeConstants";

const styles = theme => ({
  root: {
    width: "100%",
    overflowX: "auto",
  },
  tableCell: {
	  fontSize: "14px",
	  fontWeight: theme.typography.fontWeightRegular,
	  fontFamily: FONT_FAMILY
  }
});

/**
 * This component renders a table displaying details about the distribution of each activity that pedestrians
 * were tracked doing on a sidewalk
 */
class PedestrianDataComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {classes} = this.props;
		return (
			<Paper className={classes.root}>
			  <Table>
				<TableHead>
				  <TableRow>
					<TableCell className={classes.tableCell}>Activity</TableCell>
					<TableCell className={classes.tableCell} numeric>Percentage</TableCell>
				  </TableRow>
				</TableHead>
				<TableBody>
				  {this.props.activities.map((row, index) => {
					return (
					  <TableRow key={index}>
						<TableCell className={classes.tableCell} component="th" scope="row">
						  {row.type}
						</TableCell>
						<TableCell className={classes.tableCell} numeric>{row.distributionPercent * 100}</TableCell>
					  </TableRow>
					);
				  })}
				</TableBody>
			  </Table>
			</Paper>
		);
	}
}

export default withStyles(styles)(PedestrianDataComponent);