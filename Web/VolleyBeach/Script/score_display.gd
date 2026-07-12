extends Control

@onready var label: Label = $Label

var _score := 0

func set_score(value: int) -> void:
	_score = clamp(value, 0, 9)
	label.text = str(_score)
