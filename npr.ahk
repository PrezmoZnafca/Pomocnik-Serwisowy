Esc::Reload

PgUp::
    OriginalClipboard := ClipboardAll 
    Send, {end}    
    Sleep, 250
    Send, ^c    
    Sleep, 250    
    Send, {F11} 
    Sleep, 250  
    Send, ^v    
    Send, {Enter}
    
    Clipboard := OriginalClipboard      
    OriginalClipboard := ""             
Return

Home::
    
    WinActivate, Zlecenia  
    WinWaitActive, Zlecenia
    Click, 1817, 43
    Sleep, 10
    Click, 1211, 42
Sleep, 10

Send, {F5}
   Sleep, 10
return




Numpad1::
    WinActivate, Zlecenia
    WinWaitActive, Zlecenia
    Send, ^c
    Sleep, 50

    WinActivate, Signal
    WinWaitActive, Signal
    Send, ^f
    Sleep, 80
    Send, Przemek P
    Sleep, 500
    Send, {Enter}
    Sleep, 200

    Send, ^v
    Sleep, 500
    Send, `; faktura} 
    Sleep, 200
    Send, {Enter}
    WinActivate, Zlecenia
return

Numpad2::
Menu, MyMenu, Add, Pismo Sprawne, MenuHandler2
Menu, MyMenu, Add, Pismo Wymiana, MenuHandler2
Menu, MyMenu, Add, Zgoda, MenuHandler2
Menu, MyMenu, Add, Faktura, MenuHandler2
Menu, MyMenu, Add, Naprawa Warunkowa Konserwacja, MenuHandler2   

   WinActivate, Zlecenia
    WinWaitActive, Zlecenia
    Send, ^c
    Sleep, 50
	Menu, MyMenu, Show

    WinActivate, Signal
    WinWaitActive, Signal
    Send, ^f
    Sleep, 80
    Send, Przemek P
    Sleep, 300
    Send, {Enter}
    Sleep, 100

    Send, ^v
    Sleep, 500
      

MenuHandler2:
    Send, `; %A_ThisMenuItem%
	Sleep, 50
	send, {Enter}
	WinActivate, Zlecenia
	return



Numpad7::
Numpad8::






    Gui, MainGUI:New, +AlwaysOnTop +ToolWindow, Wybierz lokalizację i usterkę
    Gui, Font, s10, Arial

  
 

   
    Gui, Add, GroupBox, x10 y10 w250 h200, Lokalizacje
    locations := ["W3K1", "W3K2", "W3K3", "W3K4", "W3K5", "W4K1", "W4K2", "W4K3", "W4K4", "B-KS"]
    Loop, 5 {
        ; Pierwsza kolumna
        Gui, Add, Button, % "x20 y" (40 + (A_Index - 1) * 35) " w100 h30 gLocationButton", % locations[A_Index]
        ; Druga kolumna
        Gui, Add, Button, % "x140 y" (40 + (A_Index - 1) * 35) " w100 h30 gLocationButton", % locations[A_Index + 5]
    }

  
    Gui, Add, GroupBox, x270 y10 w200 h200, Kody usterek
    faultCodes := {"Elektronika":"0599", "Przekladnia":"0399", "Akumulator":"0799"
                  , "Silnik":"0299", "Ladowarka":"0804", "Bez Usterki":"1104"}
    for key, value in faultCodes {
        Gui, Add, Button, % "x280 y" (40 + (A_Index - 1) * 35) " w180 h30 gFaultButton", % key
    }

    ; Wyświetlenie GUI
    Gui, Show, w490 h260

Return

LocationButton:
    GuiControlGet, location,, %A_GuiControl%
    PasteText(location)
Return


FaultButton:
    GuiControlGet, fault,, %A_GuiControl%
    faultCode := faultCodes[fault]
    PasteText(faultCode)
Return


PasteText(text) {


    ; Zamknij GUI
    Gui, Destroy 


    Clipboard := text
    Send, ^v
    Sleep, 100  ; Czekaj na wklejenie

    
}
 
 
 
return



NumpadAdd::
    
    WinActivate, Zlecenia

   
    WinWaitActive, Zlecenia

    Click, 163, 70

    Sleep, 2300
    
    Click, 1817, 43

    Sleep, 10

    Click, 1211, 42

Sleep, 10

Send, {F5}

    Sleep, 10
return



Numpad9::

    WinActivate, Zlecenia

   
    WinWaitActive, Zlecenia

Click, 31, 547

Sleep, 100

Click, 1008, 650

Sleep, 100

Send, {insert}

Send, {tab}
Sleep, 200
Send, {tab}
Sleep, 100
Send, {down}
Sleep, 100
Send, {down}
Sleep, 100
Send, {tab}

Sleep, 300

 
	Menu, MyMenu, Add, Brak konserwacji urzadzenia, MenuHandler    
	Menu, MyMenu, Add, Zuzycie eksploatacyjne urzadzenia, MenuHandler
	Menu, MyMenu, Add, Przeciazenie urzadzenia, MenuHandler
	Menu, MyMenu, Add, Przeciazenie / Zuzycie eksploatacyjne urzadzenia, MenuHandler
	Menu, MyMenu, Add, Przeciazenie urzadzenia / Brak konserwacji urzadzenia, MenuHandler
    Menu, MyMenu, Add, Uszkodzenie mechaniczne urzadzenia, MenuHandler
	Menu, MyMenu, Add, Gwozdziarka posmarowana przez klienta, MenuHandler
	Menu, MyMenu, Add, Wymiana uchwytu, MenuHandler
    Menu, MyMenu, Show


MenuHandler:
    Send, % A_ThisMenuItem



Send, {enter}

return

NumpadSub::


MouseMove, 368, 142
click, left
send, !{delete}


y:= 100 

MouseMove, 502, y  
Click, down
sleep, 200
MouseMove, 394, y
sleep, 200
Click, up

MouseMove, 985, y  
Click, down
sleep, 200
MouseMove, 479, y
sleep, 200
Click, up

MouseMove, 758, y  
Click, down
sleep, 200
MouseMove, 546, y
sleep, 200
Click, up

MouseMove, 776, y  
Click, down
sleep, 200
MouseMove, 650, y
sleep, 200
Click, up

MouseMove, 936, y  
Click, down
sleep, 200
MouseMove, 735, y
sleep, 200
Click, up

MouseMove, 1111, y  
Click, down
sleep, 200
MouseMove, 764, y
sleep, 200
Click, up

MouseMove, 1317, y  
Click, down
sleep, 200
MouseMove, 820, y
sleep, 200
Click, up


MouseMove, 869, 140
Click

Loop, 10
{
send, !{delete}
sleep, 100
}



; NFC
click, left
click, right

Loop, 2
{
send, {up}
sleep, 100
}
send, {right}

Loop, 54
{
send, {up}
sleep, 65
}

send, {enter}




; Czas katalogowy
click, left
click, right

Loop, 2
{
send, {up}
sleep, 100
}
send, {right}

Loop, 17
{
send, {down}
sleep, 50
}

send, {enter}


; Kod Usterki
click, left
click, right

Loop, 2
{
send, {up}
sleep, 100
}
send, {right}

Loop, 52
{
send, {down}
sleep, 65
}

send, {enter}

MouseMove, 1150, y  
Click, down
sleep, 200
MouseMove, 879, y
sleep, 200
Click, up


return


Numpad5::
ControlClick, Etapy  , Zlecenia
return

