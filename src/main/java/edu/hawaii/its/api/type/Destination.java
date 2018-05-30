package edu.hawaii.its.api.type;

public class Destination {

    private String name;
    private String displayName;
    private String description;

    public Destination() {
        this("", "", "");
    }

    /**
     * Creates a new destination.
     * @param name: the name of the destination
     * @param displayName: the display name of the destination (to be displayed on the UI)
     * @param description: a description of the destination
     */
    public Destination(String name, String displayName, String description) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String geDisplayName() {
        return displayName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return "Destination [name=" + name
                + ", displayName=" + displayName
                + ", description=" + description
                + "]";
    }

}
