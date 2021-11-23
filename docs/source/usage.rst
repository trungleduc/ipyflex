=============
Usage
=============

**ipyflex** is meant to be used with widgets based on `ipywidgets`_. The entry point of **ipyflex** is the `FlexLayout` class, it allows users to dynamically customize the layout and fill their dashboard from the existing widgets.

Create a dashboard from existing widgets
==========================================

The simplest way to create an **ipyflex** dashboard is to create a dictionary of existing widgets with the `keys` are the names of the widget and `values` are the instances of widgets and then use `FlexLayout` to compose the layout.

.. code:: Python

    from ipyflex import FlexLayout
    import ipywidgets as ipw
    widgets = { 'Widget 1': ipw.HTML('<h1> Widget 1</h1>'),
                'Widget 2': ipw.HTML('<h1> Widget 2</h1>'), 
                'Widget 3': ipw.HTML('<h1> Widget 3</h1>'),
                'Widget 4': ipw.HTML('<h1> Widget 4</h1>')
            }
    dashboard = FlexLayout(widgets)
    dashboard

.. image:: images/ipyflex.gif

----------------------------
FlexLayout interface
----------------------------

*FlexLayout* interface is composed aof three components:

- Toolbar: located at bottom of the interface, it contains the button to save the current layout template to disk.
- Section tab bar: a bar to hold the section tabs, it is located on top of the toolbar. A *FlexLayout* dashboard can contain multiple sections.
- Section display window: the activated section is shown in this window. Each section is can be composed of multiple widgets.

A typical interface is displayed in the figure below:

.. image:: images/ipyflex-main.png

----------------------------
Toolbar 
----------------------------

- **Save template**: save dashboard configuration into a *json* file in the current working folder. If *FlexLayout* is started with a template, the current template will be overwritten.

----------------------------
Section tab bar 
----------------------------

- Uses can use **+** button to add a new section into the dashboard, a section is displayed as a tab in the section tab bar. Each section can be dragged to modify its position, double-clicked to rename, and removed with the **x** button.

.. image:: images/ipyflex-section.gif

--------------------------
Section display window
--------------------------

- A section is composed of multiple widgets, users can use the *add widget* button to add the predefined widgets into the section. The added widget will be displayed in the widget tab bar with the name taken from its key in the widget dictionary.
- A typical layout of a section with annotation for buttons is shown in the image below:

.. image:: images/ipyflex-widget-window.png

- The widget menu can be opened by the *add widget* button, it contains the keys of the widget dictionary defined in the constructor of *FlexLayout*. The *Create new* item in the widget menu is always available, it will be detailed in the next section. 
- User can customize the layout of a section by using drag and drop on each widget. The widgets can also be resized by dragging its borders.

.. links

.. _`ipywidgets`: https://github.com/jupyter-widgets/ipywidgets/