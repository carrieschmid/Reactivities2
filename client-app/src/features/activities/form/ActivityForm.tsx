import React, { useState, useContext, useEffect } from "react";
import { Segment, Form, Button, GridColumn, Grid } from "semantic-ui-react";
import { ActivityFormValues } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";

import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../../app/common/form/TextInput";
import TextAreaInput from "../../../app/common/form/TextAreaInput";
import SelectInput from "../../../app/common/form/SelectInput";
import DateInput from "../../../app/common/form/DateInput";
import { category } from "../../../app/common/options/categoryOptions";
import { combinedDateAndTime } from "../../../app/common/util/util";
import {
  combineValidators,
  isRequired,
  composeValidators,
  hasLengthGreaterThan
} from "revalidate";
import { RootStoreContext } from "../../../app/stores/rootStore";

const validate = combineValidators({
  title: isRequired({ message: "The event title is required." }),
  category: isRequired("Category"),
  description: composeValidators(
    isRequired("Description"),
    hasLengthGreaterThan(4)({
      message: "Description needs to be at least 5 characters"
    })
  )(),
  city: isRequired("City"),
  venue: isRequired("Venue"),
  date: isRequired("Date"),
  time: isRequired("Time")
});

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history
}) => {
  const rootStore = useContext(RootStoreContext);
  const {
    createActivity,
    editActivity,
    submitting,
    loadActivity
  } = rootStore.activityStore;

  const [activity, setActivity] = useState(new ActivityFormValues());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match.params.id) {
      setLoading(true);
      loadActivity(match.params.id)
        .then((activity) => setActivity(new ActivityFormValues(activity)))
        .finally(() => setLoading(false));
    }
  }, [loadActivity, match.params.id]);

  const handleFinalFormSubmit = (values: any) => {
    const dateAndTime = combinedDateAndTime(values.date, values.time);
    const { date, time, ...activity } = values;
    activity.date = dateAndTime;
    // combined date and tim enot working
    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: uuid()
      };

      createActivity(newActivity);
    } else {
      editActivity(activity);
    }
  };

  return (
    <Grid>
      <GridColumn width={10}>
        <Segment clearing>
          <FinalForm
            validate={validate}
            initialValues={activity}
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit, invalid, pristine }) => (
              <Form onSubmit={handleSubmit} loading={loading}>
                <Field
                  name="title"
                  placeholder="Title"
                  value={activity.title}
                  component={TextInput}
                />
                <Field
                  name="description"
                  placeholder="Description"
                  value={activity.description}
                  rows={3}
                  component={TextAreaInput}
                />
                <Field
                  component={SelectInput}
                  options={category}
                  name="category"
                  placeholder="Category"
                  value={activity.category}
                />
                <Form.Group widths="equal">
                  <Field
                    component={DateInput}
                    name="date"
                    date={true}
                    placeholder="Date"
                    value={activity.date}
                  />
                  <Field
                    component={DateInput}
                    name="time"
                    time={true}
                    placeholder="Time"
                    value={activity.time}
                  />
                </Form.Group>

                <Field
                  component={TextInput}
                  name="city"
                  placeholder="City"
                  value={activity.city}
                />
                <Field
                  component={TextInput}
                  name="venue"
                  placeholder="Venue"
                  value={activity.venue}
                />
                <Button
                  loading={submitting}
                  disabled={loading}
                  floated="right"
                  positive
                  type="submit"
                  content="Submit"
                />
                <Button
                  onClick={
                    activity.id
                      ? () => history.push(`/activities/${activity.id}`)
                      : () => history.push("/activities")
                  }
                  disabled={loading}
                  floated="right"
                  type="button"
                  content="Cancel"
                />
              </Form>
            )}
          />
        </Segment>
      </GridColumn>
    </Grid>
  );
};

export default observer(ActivityForm);