extends Control

@onready var restart: Button = $Restart_Button

func _ready() -> void:
	restart.pressed.connect(_on_restart_pressed)

func _on_restart_pressed() -> void:
	ScoreManager.reset()
	get_tree().change_scene_to_file("res://Scenes/Game.tscn")
