def decide(carbon_intensity, hours_to_deadline, estimated_hours_remaining):
    """
    Decide whether to RUN, PAUSE, or MIGRATE based on carbon intensity and job deadline.
    Returns: "RUN", "PAUSE", or "MIGRATE"
    """
    # If we literally have no time to spare to meet the deadline, forced RUN
    if hours_to_deadline <= estimated_hours_remaining + 1:
        return "RUN"

    # If carbon intensity is very high
    if carbon_intensity > 500:
        # If we have plenty of buffer time (e.g., more than a day spare), just Pause
        if hours_to_deadline > estimated_hours_remaining + 24:
            return "PAUSE"
        else:
            # If we don't have enough buffer to wait it out comfortably, try to migrate to a greener grid
            return "MIGRATE"

    # If carbon intensity is moderately high, but deadline is not tight
    if carbon_intensity > 300:
        if hours_to_deadline > estimated_hours_remaining + 12:
            return "PAUSE"
        else:
            # Need to make progress to stay on track
            return "RUN"

    # If carbon intensity is low, always RUN
    return "RUN"